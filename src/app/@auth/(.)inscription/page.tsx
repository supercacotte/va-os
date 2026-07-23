import { Modal } from "@/components/Modal";
import SignupForm from "@/components/auth/SignupForm";

export default function InscriptionModal() {
  return (
    <Modal>
      <span className="absolute -left-3 -top-3 -rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
        2 min chrono
      </span>
      <div className="flex flex-col items-center gap-5">
        <div className="text-center">
          <h1 className="font-bowlby text-[28px] leading-tight text-ink">Créer mon compte</h1>
          <p className="mt-1 text-[13px] font-medium text-ink opacity-70">
            Ton cockpit t&apos;attend.
          </p>
        </div>
        <SignupForm />
      </div>
    </Modal>
  );
}
