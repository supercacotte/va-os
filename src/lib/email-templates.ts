const LOGO_URL = "https://smartlazyclub.com/images/medallion-email.png";

type BrandedEmailOptions = {
  heading: string;
  paragraph: string;
  buttonLabel: string;
  url: string;
};

function brandedEmailHtml({ heading, paragraph, buttonLabel, url }: BrandedEmailOptions) {
  return `
<body style="margin:0;padding:32px 16px;background-color:#f5f1e8;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border:1px solid #dacdb6;border-radius:24px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 32px 32px;text-align:center;">
              <img src="${LOGO_URL}" width="100" height="100" alt="VA Desk" style="display:inline-block;margin-bottom:24px;" />
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#24221c;margin:0 0 12px;">
                ${heading}
              </h1>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#5a5240;margin:0 0 28px;">
                ${paragraph}
              </p>
              <a href="${url}" style="display:inline-block;background-color:#d9583b;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:9999px;">
                ${buttonLabel} →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#9a8a68;margin:0;">
                Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email en toute sécurité.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>`;
}

export function magicLinkEmailHtml(url: string) {
  return brandedEmailHtml({
    heading: "Connecte-toi à ton compte",
    paragraph: "Clique sur le bouton ci-dessous pour te connecter à VA Desk. Ce lien est valable 24h.",
    buttonLabel: "Se connecter",
    url,
  });
}

export function verifyEmailHtml(url: string) {
  return brandedEmailHtml({
    heading: "Confirme ton adresse email",
    paragraph:
      "Bienvenue ! Clique sur le bouton ci-dessous pour confirmer ton adresse email. Ce lien est valable 24h.",
    buttonLabel: "Confirmer mon email",
    url,
  });
}
