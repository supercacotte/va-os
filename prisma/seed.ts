import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CLIENT_COLOR_COUNT } from "../src/lib/client-colors";
import { SLC_TEMPLATES } from "../src/lib/sop-templates";
import { sanitizeStepsHtml } from "../src/lib/sanitize";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Tous les comptes de test partagent ce mot de passe. Le compte CLIENT reçoit
// aussi un mot de passe pour tester le portail en local sans Resend — en réel,
// les clients n'ont que le magic link.
const TEST_PASSWORD = "motdepasse123";
const VA_EMAIL = "julia@test.local";
const VA2_EMAIL = "lea@test.local";
const ADMIN_EMAIL = "caro@test.local";
const CLIENT_EMAIL = "marie@test.local";

const clients = [
  {
    name: "Marie Dupont",
    company: "Studio Bloom",
    missions: [
      {
        name: "Gestion des réseaux sociaux",
        tasks: [
          { title: "Préparer le calendrier éditorial d'août", done: true },
          { title: "Programmer les posts Instagram de la semaine", done: false },
          { title: "Répondre aux commentaires et DM", done: false },
        ],
      },
      {
        name: "Support administratif",
        tasks: [
          { title: "Classer les factures fournisseurs de juillet", done: true },
          { title: "Relancer les 3 devis en attente", done: false },
        ],
      },
    ],
  },
  {
    name: "Paul Martin",
    company: "Atelier Nord",
    missions: [
      {
        name: "Onboarding nouveaux clients",
        tasks: [
          { title: "Mettre à jour le questionnaire d'accueil", done: false },
          { title: "Envoyer le kit de bienvenue au client signé lundi", done: true },
          { title: "Planifier le call de kick-off", done: false, source: "client_request" },
        ],
      },
    ],
  },
];

// Deuxième VA de test : ses données ne doivent JAMAIS apparaître chez Julia
// (et réciproquement) — sert aussi à l'audit multi-tenant de la phase 10.
const leaClients = [
  {
    name: "Thomas Petit",
    company: "Cabinet Ostéo Petit",
    missions: [
      {
        name: "Gestion de l'agenda patients",
        tasks: [
          { title: "Confirmer les rendez-vous de la semaine", done: false },
          { title: "Mettre à jour la liste d'attente", done: true },
        ],
      },
    ],
  },
  {
    name: "Anaïs Roche",
    company: "La Fabrique à Pains",
    missions: [
      {
        name: "Newsletter mensuelle",
        tasks: [
          { title: "Rédiger l'édito d'août", done: false },
          { title: "Préparer les photos des nouveautés", done: false },
        ],
      },
    ],
  },
];

type SeedClient = (typeof clients)[number];

async function seedClientsForVa(vaId: string, clientList: SeedClient[]) {
  for (const [index, clientData] of clientList.entries()) {
    await prisma.client.create({
      data: {
        vaId,
        name: clientData.name,
        company: clientData.company,
        color: (index % CLIENT_COLOR_COUNT) + 1,
        missions: {
          create: clientData.missions.map((mission) => ({
            name: mission.name,
            tasks: {
              create: mission.tasks.map((task) => ({
                title: task.title,
                done: task.done,
                ...("source" in task ? { source: task.source } : {}),
              })),
            },
          })),
        },
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  let va = await prisma.user.findUnique({ where: { email: VA_EMAIL } });
  if (!va) {
    va = await prisma.user.create({
      data: {
        email: VA_EMAIL,
        name: "Julia",
        lastName: "Test",
        password: passwordHash,
        role: "VA",
        emailVerified: new Date(),
      },
    });
  }

  const existingClients = await prisma.client.count({ where: { vaId: va.id } });
  if (existingClients === 0) {
    await seedClientsForVa(va.id, clients);
  }

  let va2 = await prisma.user.findUnique({ where: { email: VA2_EMAIL } });
  if (!va2) {
    va2 = await prisma.user.create({
      data: {
        email: VA2_EMAIL,
        name: "Léa",
        lastName: "Demo",
        password: passwordHash,
        role: "VA",
        emailVerified: new Date(),
      },
    });
  }

  const existingVa2Clients = await prisma.client.count({ where: { vaId: va2.id } });
  if (existingVa2Clients === 0) {
    await seedClientsForVa(va2.id, leaClients);
  }

  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: "Caro",
        lastName: "Admin",
        password: passwordHash,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
  }

  const clientUser = await prisma.user.findUnique({ where: { email: CLIENT_EMAIL } });
  if (!clientUser) {
    const marie = await prisma.client.findFirst({
      where: { vaId: va.id, name: "Marie Dupont" },
      include: { portalUser: { select: { id: true } } },
    });
    if (marie && !marie.portalUser) {
      await prisma.user.create({
        data: {
          email: CLIENT_EMAIL,
          name: "Marie Dupont",
          password: passwordHash,
          role: "CLIENT",
          clientId: marie.id,
          emailVerified: new Date(),
        },
      });
    }
  }

  // Backfill one-shot des couleurs clients (DESIGN.md §1) : uniquement si
  // les clients d'une VA sont encore tous au défaut (color=1) — on n'écrase
  // jamais une couleur réellement attribuée.
  const vas = await prisma.user.findMany({ where: { role: "VA" }, select: { id: true } });
  for (const someVa of vas) {
    const vaClients = await prisma.client.findMany({
      where: { vaId: someVa.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, color: true },
    });
    if (vaClients.length > 1 && vaClients.every((client) => client.color === 1)) {
      for (const [index, client] of vaClients.entries()) {
        await prisma.client.update({
          where: { id: client.id },
          data: { color: (index % CLIENT_COLOR_COUNT) + 1 },
        });
      }
    }
  }

  // Profils d'annuaire de démo (D17) — comptes VA fictifs, publiés.
  const demoProfiles = [
    { email: "julia.moreau@test.local", displayName: "Julia Moreau", headline: "Admin & orga pour solopreneurs débordés — boîte mail à zéro, factures à l'heure, agendas qui respirent.", bio: "Boîte mail à zéro, factures à l'heure, agendas qui respirent. J'aide les solopreneurs à retrouver du temps et de la clarté dans leur quotidien.", specialties: ["Admin", "Compta"], location: "Nantes — full remote", region: "pdl", languages: ["FR", "EN"], availability: "available", availabilityNote: null },
    { email: "sarah.lopez@test.local", displayName: "Sarah Lopez", headline: "Réseaux sociaux & contenu : calendrier édito, visuels Canva, communauté qui répond présente.", bio: "Calendrier édito, visuels Canva, community management : je fais vivre vos réseaux pendant que vous faites tourner votre boîte.", specialties: ["Réseaux sociaux", "Canva"], location: "Lyon", region: "ara", languages: ["FR", "ES"], availability: "available", availabilityNote: null },
    { email: "camille.bardet@test.local", displayName: "Camille Bardet", headline: "E-commerce : SAV, suivi de commandes, fiches produit — vos clients répondus en moins de 24 h.", bio: "SAV, suivi de commandes, fiches produit : vos clients e-commerce répondus en moins de 24 h, sept jours sur sept si besoin.", specialties: ["E-commerce", "Support client"], location: "Bordeaux", region: "naq", languages: ["FR"], availability: "full", availabilityNote: "dès sept." },
    { email: "aicha.konate@test.local", displayName: "Aïcha Konaté", headline: "Assistante de direction bilingue : agendas complexes, déplacements, comptes-rendus impeccables.", bio: "Assistante de direction bilingue : agendas complexes, organisation de déplacements, comptes-rendus impeccables et confidentialité totale.", specialties: ["Admin", "Agenda"], location: "Paris", region: "idf", languages: ["FR", "EN"], availability: "available", availabilityNote: null },
  ];
  for (const demo of demoProfiles) {
    let user = await prisma.user.findUnique({ where: { email: demo.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: demo.email, name: demo.displayName.split(" ")[0], role: "VA", emailVerified: new Date() },
      });
    }
    await prisma.vaProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, published: true, ...demoData(demo) },
      update: {},
    });
  }

  // Procédures d'exemple (Phase 6, D22) : on instancie 2 templates SLC comme
  // vraies procédures sur Marie Dupont — le client de test qui a un portail.
  // Les templates SLC eux-mêmes ne sont PAS stockés ; ce sont des modèles.
  const marieForSop = await prisma.client.findFirst({
    where: { vaId: va.id, name: "Marie Dupont" },
    select: { id: true, hourlyRate: true },
  });
  // Taux horaire de démo pour le bloc CA (maquette 32a) — seulement si absent.
  if (marieForSop && marieForSop.hourlyRate === null) {
    await prisma.client.update({
      where: { id: marieForSop.id },
      data: { hourlyRate: 45 },
    });
  }
  if (marieForSop) {
    const existingSop = await prisma.procedure.count({
      where: { clientId: marieForSop.id },
    });
    if (existingSop === 0) {
      for (const template of SLC_TEMPLATES.slice(0, 2)) {
        await prisma.procedure.create({
          data: {
            vaId: va.id,
            clientId: marieForSop.id,
            title: template.title,
            steps: sanitizeStepsHtml(template.html),
          },
        });
      }
    }
  }

  console.log(
    `Seed OK — VA ${VA_EMAIL} (${clients.length} clients), VA ${VA2_EMAIL} (${leaClients.length} clients), ADMIN ${ADMIN_EMAIL}, CLIENT ${CLIENT_EMAIL} — mot de passe commun : ${TEST_PASSWORD}.`,
  );
}

function demoData(demo: {
  displayName: string; headline: string; bio: string; specialties: string[];
  location: string; region: string; languages: string[]; availability: string;
  availabilityNote: string | null; email: string;
}) {
  const { email: _email, ...rest } = demo;
  return rest;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
