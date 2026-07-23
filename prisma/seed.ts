import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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
  for (const clientData of clientList) {
    await prisma.client.create({
      data: {
        vaId,
        name: clientData.name,
        company: clientData.company,
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

  console.log(
    `Seed OK — VA ${VA_EMAIL} (${clients.length} clients), VA ${VA2_EMAIL} (${leaClients.length} clients), ADMIN ${ADMIN_EMAIL}, CLIENT ${CLIENT_EMAIL} — mot de passe commun : ${TEST_PASSWORD}.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
