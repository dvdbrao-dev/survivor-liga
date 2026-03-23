type WhatsAppShareButtonProps = {
  inviteUrl: string;
};

export function WhatsAppShareButton({ inviteUrl }: WhatsAppShareButtonProps) {
  const message = `Te paso tu enlace para entrar en Survivor Liga: ${inviteUrl}`;
  const href = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a className="btn btn-secondary" href={href} target="_blank" rel="noopener noreferrer">
      Compartir por WhatsApp
    </a>
  );
}
