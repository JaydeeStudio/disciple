import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

function getSilhouetteSvg(characterKey: string, gender: string = 'M'): string {
  const ink = '#24201D';
  const terracotta = '#C25E42';
  const ochre = '#D49B44';
  const sage = '#5F7363';
  const parchment = '#F7F2E8';
  const parchmentBorder = '#E5DBCB';
  const isFemale = gender === 'F';

  let graphic = '';
  switch (characterKey) {
    case 'jean':
      graphic = `
        <circle cx="100" cy="70" r="48" fill="${ochre}" opacity="0.18" />
        <circle cx="100" cy="70" r="38" stroke="${ochre}" stroke-width="1.5" stroke-dasharray="3 3" fill="none" />
        <ellipse cx="100" cy="56" rx="14" ry="17" fill="${ink}" />
        <path d="M78 72 C78 62, 88 50, 100 50 C112 50, 122 62, 122 72 C122 88, 126 120, 128 155 C128 165, 72 165, 72 155 C74 120, 78 88, 78 72 Z" fill="${ink}" />
        <path d="M84 76 C92 84, 108 84, 116 76 C120 90, 114 115, 100 120 C86 115, 80 90, 84 76 Z" fill="${terracotta}" opacity="0.9" />
        <path d="M88 124 Q100 128 112 124 L114 136 Q100 140 86 136 Z" fill="#FFFDF8" stroke="${ink}" stroke-width="1.5" />
        <line x1="100" y1="126" x2="100" y2="138" stroke="${ink}" stroke-width="1" />
        <circle cx="100" cy="38" r="3" fill="${ochre}" />
      `;
      break;
    case 'pierre':
      graphic = `
        <path d="M60 160 L100 40 L140 160 Z" fill="${terracotta}" opacity="0.08" />
        <circle cx="100" cy="62" r="38" fill="${ochre}" opacity="0.15" />
        <ellipse cx="98" cy="52" rx="15" ry="18" fill="${ink}" />
        <path d="M72 75 C72 65, 85 58, 98 58 C112 58, 124 65, 124 75 L132 160 L64 160 Z" fill="${ink}" />
        <path d="M78 80 L118 80 L112 135 L84 135 Z" fill="${terracotta}" opacity="0.85" />
        <line x1="134" y1="40" x2="134" y2="160" stroke="${ochre}" stroke-width="3.5" stroke-linecap="round" />
        <path d="M134 40 C134 30, 148 30, 148 42 C148 50, 138 52, 134 52" fill="none" stroke="${ochre}" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="98" cy="100" r="4" fill="#FFFDF8" />
      `;
      break;
    case 'paul':
      graphic = `
        <path d="M100 22 C96 30, 92 34, 100 42 C108 34, 104 30, 100 22 Z" fill="${terracotta}" />
        <circle cx="100" cy="70" r="42" fill="${ochre}" opacity="0.16" />
        <ellipse cx="100" cy="56" rx="14" ry="17" fill="${ink}" />
        <path d="M92 68 Q100 78 108 68 Z" fill="${ink}" />
        <path d="M72 76 C72 65, 86 60, 100 60 C114 60, 128 65, 128 76 L134 160 L66 160 Z" fill="${ink}" />
        <path d="M82 82 L118 82 L112 125 L88 125 Z" fill="${ochre}" opacity="0.85" />
        <rect x="74" y="112" width="32" height="18" rx="2" fill="#FFFDF8" stroke="${ink}" stroke-width="1.5" />
        <line x1="78" y1="117" x2="102" y2="117" stroke="${ink}" stroke-width="1" />
        <line x1="78" y1="122" x2="98" y2="122" stroke="${ink}" stroke-width="1" />
        <path d="M114 100 Q122 108 116 118" stroke="${terracotta}" stroke-width="2.5" fill="none" stroke-linecap="round" />
      `;
      break;
    case 'marie_madeleine':
    case 'marie_magdala':
      graphic = `
        <circle cx="100" cy="65" r="40" fill="${ochre}" opacity="0.16" />
        <ellipse cx="100" cy="52" rx="13" ry="16" fill="${ink}" />
        <path d="M72 70 C68 95, 66 130, 64 160 L136 160 C134 130, 132 95, 128 70 C122 56, 78 56, 72 70 Z" fill="${ink}" />
        <path d="M78 85 C84 110, 80 135, 74 160" stroke="${terracotta}" stroke-width="2.5" fill="none" />
        <path d="M122 85 C116 110, 120 135, 126 160" stroke="${terracotta}" stroke-width="2.5" fill="none" />
        <path d="M92 120 L108 120 L104 145 L96 145 Z" fill="${ochre}" />
        <circle cx="100" cy="116" r="3" fill="${terracotta}" />
      `;
      break;
    case 'barnabe':
      graphic = `
        <circle cx="100" cy="65" r="40" fill="${sage}" opacity="0.2" />
        <ellipse cx="100" cy="54" rx="14" ry="17" fill="${ink}" />
        <path d="M72 74 C72 64, 86 58, 100 58 C114 58, 128 64, 128 74 L132 160 L68 160 Z" fill="${ink}" />
        <path d="M80 80 L120 80 L114 135 L86 135 Z" fill="${sage}" opacity="0.85" />
        <path d="M88 115 Q100 125 112 115" stroke="#FFFDF8" stroke-width="2.5" fill="none" stroke-linecap="round" />
      `;
      break;
    default:
      graphic = `
        <circle cx="100" cy="70" r="42" fill="${terracotta}" opacity="0.16" />
        <ellipse cx="100" cy="54" rx="${isFemale ? 13 : 14}" ry="16" fill="${ink}" />
        <path d="M74 74 C74 64, 86 58, 100 58 C114 58, 126 64, 126 74 L130 160 L70 160 Z" fill="${ink}" />
        <line x1="128" y1="46" x2="128" y2="160" stroke="${ochre}" stroke-width="2.5" stroke-linecap="round" />
        <path d="M84 82 L116 82 L112 135 L88 135 Z" fill="${sage}" opacity="0.8" />
      `;
      break;
  }

  return `
    <svg viewBox="0 0 200 200" width="130" height="130" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
      <path d="M30 176 L30 84 Q30 24 100 24 Q170 24 170 84 L170 176 Q100 178 30 176 Z" fill="${parchment}" stroke="${parchmentBorder}" stroke-width="2" />
      <path d="M36 172 L36 84 Q36 30 100 30 Q164 30 164 84 L164 172" fill="none" stroke="${ochre}" stroke-width="0.8" opacity="0.4" />
      ${graphic}
      <line x1="38" y1="162" x2="162" y2="162" stroke="${ink}" stroke-width="1.8" opacity="0.4" stroke-linecap="round" />
    </svg>
  `;
}

async function handleSendResult(req: Request, res: Response) {
  try {
    const { 
      email, 
      archetypeKey, 
      archetypeName, 
      archetypeTitle, 
      biblicalVerse, 
      userName, 
      affinity = 94, 
      siteUrl = 'https://discipledejesus.netlify.app' 
    } = req.body;

    if (!email || !archetypeName) {
      return res.status(400).json({ error: 'Email et figure biblique requis' });
    }

    const gmailUser = process.env.GMAIL_USER || 'contact.discipledejesus@gmail.com';
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!gmailAppPassword && !resendApiKey) {
      return res.status(200).json({ 
        success: false, 
        warning: 'CONFIG_EMAIL_MANQUANTE',
        message: "L'adresse a bien été enregistrée en base. Pour activer l'envoi d'e-mail automatique, configurez GMAIL_APP_PASSWORD (ou RESEND_API_KEY) dans vos variables d'environnement."
      });
    }

    const cleanNameParam = userName && userName !== 'Disciple' ? `&nom=${encodeURIComponent(userName)}` : '';
    const resultUrl = `${siteUrl}/resultats/${archetypeKey || 'jean'}?score=${affinity}${cleanNameParam}`;
    const directPdfUrl = `${resultUrl}&pdf=1`;
    const stripePaymentUrl = process.env.VITE_STRIPE_PAYMENT_URL || 'https://buy.stripe.com/7sY8wP6Xj2ta06oexaeIw00';

    const greeting = userName && userName.trim() && userName !== 'Disciple' 
      ? `Bonjour ${userName},` 
      : `Bonjour,`;

    const verseText = biblicalVerse 
      ? biblicalVerse 
      : "Chaque membre du Corps a reçu une grâce particulière pour l'édification de tous.";

    const silhouetteSvg = getSilhouetteSvg(archetypeKey || 'jean');

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Votre synthèse de profil : ${archetypeName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          body {
            margin: 0;
            padding: 0;
            background-color: #f7f4ee;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #242220;
            -webkit-font-smoothing: antialiased;
          }
          .serif-title {
            font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f4ee; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #242220;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f4ee; padding: 32px 12px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="620" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 24px; border: 1px solid #ebd9c5; overflow: hidden; box-shadow: 0 10px 30px rgba(36, 34, 32, 0.06);">
                <tr>
                  <td style="background-color: #242220; padding: 22px 24px 20px; text-align: center; border-bottom: 2px solid #d4a373;">
                    <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 8px auto;">
                      <tr>
                        <td align="center">
                          <svg width="38" height="38" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                            <rect width="44" height="44" rx="12" fill="#2d2a27" stroke="#d4a373" stroke-width="1.5" />
                            <circle cx="22" cy="22" r="14" stroke="#c09462" stroke-width="1" stroke-dasharray="2 3" opacity="0.45" />
                            <path d="M22 8L24.5 19.5L36 22L24.5 24.5L22 36L19.5 24.5L8 22L19.5 19.5L22 8Z" fill="#d4a373" opacity="0.95" />
                            <circle cx="22" cy="22" r="2.5" fill="#fdfaf5" />
                            <path d="M14 14L17 17M30 30L27 27M30 14L27 17M14 30L17 27" stroke="#fdfaf5" stroke-width="1.2" stroke-linecap="round" opacity="0.65" />
                          </svg>
                        </td>
                      </tr>
                    </table>
                    <div class="serif-title" style="font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 3px; color: #ffffff; line-height: 1;">
                      DISCIPLE
                    </div>
                    <div style="font-size: 10px; color: #a19d95; margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase;">
                      Archétypes bibliques
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 34px 30px 28px;">
                    <div style="text-align: center; margin-bottom: 16px;">
                      <span style="display: inline-block; background-color: #fcf1eb; color: #b8623b; border: 1px solid #f2cfbf; padding: 5px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        ✦ ${affinity}% de résonance
                      </span>
                    </div>
                    <div style="text-align: center; margin-bottom: 16px;">
                      ${silhouetteSvg}
                    </div>
                    <h1 class="serif-title" style="text-align: center; font-family: 'Cinzel', Georgia, serif; margin: 0 0 6px 0; font-size: 32px; font-weight: 700; color: #242220; line-height: 1.15;">
                      ${archetypeName}
                    </h1>
                    ${archetypeTitle ? `
                      <p style="text-align: center; margin: 0 0 20px 0; font-size: 16px; color: #6b705c; font-style: italic; font-weight: 500;">
                        ${archetypeTitle}
                      </p>
                    ` : `
                      <p style="text-align: center; margin: 0 0 20px 0; font-size: 16px; color: #6b705c; font-style: italic;">
                        Votre synthèse de profil et repères de discernement
                      </p>
                    `}
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      <tr>
                        <td align="center">
                          <div style="max-width: 480px; background-color: #fdfaf5; border: 1px solid #ebd9c5; border-left: 3px solid #d4a373; border-right: 3px solid #d4a373; padding: 14px 20px; border-radius: 12px; text-align: center;">
                            <p style="margin: 0; font-size: 13.5px; font-style: italic; line-height: 1.6; color: #3a3835;">
                              « ${verseText} »
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 15px; line-height: 1.6; color: #403d39; margin-bottom: 24px; text-align: left;">
                      ${greeting}<br><br>
                      Comme convenu lors de votre test <strong>« Quel disciple de Jésus êtes-vous ? »</strong>, voici votre synthèse personnalisée.
                    </p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcf7ef; border: 1.5px solid #ebd9c5; border-radius: 18px; padding: 24px 20px; margin-bottom: 30px; text-align: center;">
                      <tr>
                        <td>
                          <div style="font-size: 19px; font-weight: 700; color: #242220; margin-bottom: 8px;">
                            Synthèse de profil
                          </div>
                          <p style="margin: 0 0 18px 0; font-size: 13px; color: #6b705c; line-height: 1.5; max-width: 440px; margin-left: auto; margin-right: auto;">
                            Retrouvez vos 5 axes d'équilibre, vos forces motrices et vos repères de progression dans un document haute fidélité prêt à être imprimé ou conservé.
                          </p>
                          <a href="${directPdfUrl}" target="_blank" style="display: inline-block; background-color: #242220; color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 12px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(36, 34, 32, 0.15);">
                            Télécharger ma synthèse PDF →
                          </a>
                          <div style="margin-top: 12px;">
                            <a href="${resultUrl}" target="_blank" style="font-size: 12px; color: #b8623b; text-decoration: underline; font-weight: 600;">
                              Ou consulter mon profil interactif en ligne avec mon diagramme
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f7f4ee; padding: 22px 30px; text-align: center; border-top: 1px solid #ebd9c5;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b705c; font-weight: 700;">
                      Quel disciple de Jésus êtes-vous ?
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #878278;">
                      Découverte des figures bibliques, des postures intérieures et du travail sur soi.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (gmailAppPassword) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword.replace(/\s+/g, ''),
        },
      });

      const info = await transporter.sendMail({
        from: `"Quel disciple suis-je" <${gmailUser}>`,
        to: email,
        replyTo: gmailUser,
        subject: `Votre figure biblique : ${archetypeName} (${affinity}% de résonance)`,
        html: emailHtml,
      });

      return res.status(200).json({ 
        success: true, 
        provider: 'gmail',
        id: info.messageId,
        message: 'Email envoyé avec succès via Gmail !'
      });
    }

    if (resendApiKey) {
      const fromSender = process.env.RESEND_FROM_EMAIL || 'Disciple <onboarding@resend.dev>';
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromSender,
          to: [email],
          subject: `Votre figure biblique : ${archetypeName} (${affinity}% de résonance)`,
          html: emailHtml
        })
      });

      const resendData = await resendResponse.json() as any;

      if (!resendResponse.ok) {
        return res.status(resendResponse.status).json({ 
          success: false, 
          error: resendData.message || 'Erreur lors de l’envoi avec Resend',
          details: resendData
        });
      }

      return res.status(200).json({ 
        success: true, 
        provider: 'resend',
        id: resendData.id,
        message: 'Email envoyé avec succès via Resend !'
      });
    }

    return res.status(200).json({ success: true, message: 'Enregistré' });
  } catch (err: any) {
    console.error('Function error:', err);
    return res.status(500).json({ error: err.message || 'Erreur interne' });
  }
}

// API Routes
app.post('/api/send-result', handleSendResult);
app.post('/.netlify/functions/send-result', handleSendResult);
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (0.0.0.0:${PORT})`);
  });
}

startServer();
