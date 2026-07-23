import { Modal } from "@/components/Modal";
import SignupForm from "@/components/auth/SignupForm";

export default function InscriptionModal() {
  return (
    <Modal>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-[19px] font-bold text-ink">Créer ton compte</h1>
          <p className="mt-1 text-[13px] font-medium text-ink opacity-70">
            Ton cockpit d&apos;assistante virtuelle, prêt en deux minutes.
          </p>
        </div>
        <SignupForm />
      </div>
    </Modal>
  );
}
