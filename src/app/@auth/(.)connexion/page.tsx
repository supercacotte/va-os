import { Modal } from "@/components/Modal";
import LoginForm from "@/components/auth/LoginForm";

export default function ConnexionModal() {
  return (
    <Modal>
      <span className="absolute -left-3 -top-3 -rotate-3 rounded-[10px] border-4 border-paper bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
        re-bonjour
      </span>
      <LoginForm />
    </Modal>
  );
}
