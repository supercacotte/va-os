import { Modal } from "@/components/Modal";
import SignupForm from "@/components/auth/SignupForm";

export default function InscriptionModal() {
  return (
    <Modal>
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="font-display text-2xl text-ink">Créer ton compte</h1>
          <p className="mt-2 font-body text-sm text-muted-2">
            Ton cockpit d&apos;assistante virtuelle, prêt en deux minutes.
          </p>
        </div>
        <SignupForm />
      </div>
    </Modal>
  );
}
