export default function VerifyRequestPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="font-display text-3xl text-ink">Vérifie ta boîte mail</h1>
      <p className="max-w-sm font-body text-sm text-muted-2">
        On vient de t&apos;envoyer un lien magique. Clique dessus pour te connecter.
      </p>
    </main>
  );
}
