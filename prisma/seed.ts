import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const VA_EMAIL = "julia@test.local";
const VA_PASSWORD = "motdepasse123";

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

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: VA_EMAIL } });
  if (existing) {
    console.log(`Seed déjà passé (${VA_EMAIL} existe) — rien à faire.`);
    return;
  }

  const va = await prisma.user.create({
    data: {
      email: VA_EMAIL,
      name: "Julia",
      lastName: "Test",
      password: await bcrypt.hash(VA_PASSWORD, 10),
      role: "VA",
      emailVerified: new Date(),
    },
  });

  for (const clientData of clients) {
    await prisma.client.create({
      data: {
        vaId: va.id,
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

  console.log(`Seed OK — VA ${VA_EMAIL} (mot de passe : ${VA_PASSWORD}), ${clients.length} clients, missions et tâches créés.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
