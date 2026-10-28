// Netlify Serverless Function for sending Archetype Results via Resend API
// Does not require external packages as it uses native Node fetch

export default async (req, context) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { email, archetypeKey, archetypeName, affinity = 94, siteUrl = 'https://discipledejesus.netlify.app' } = body;

    if (!email || !archetypeName) {
      return new Response(JSON.stringify({ error: 'Email et archétype requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('RESEND_API_KEY is not defined in Netlify Environment Variables.');
      return new Response(JSON.stringify({ 
        success: false, 
        warning: 'RESEND_API_KEY_MANQUANTE',
        message: "L'adresse a été enregistrée en base. Pour activer l'envoi d'e-mail automatique, ajoutez votre variable RESEND_API_KEY dans le tableau de bord Netlify."
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sender email: Use custom verified domain if provided, or fallback to Resend onboarding sandbox
    const fromSender = process.env.RESEND_FROM_EMAIL || 'Disciple <onboarding@resend.dev>';
    const resultUrl = `${siteUrl}/resultats/${archetypeKey || 'jean'}?score=${affinity}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Votre archétype biblique : ${archetypeName}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #242220;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f4ee; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e7ded0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #242220; padding: 26px 30px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #d4a373; text-transform: uppercase; margin-bottom: 4px;">
                      Test des archétypes bibliques
                    </div>
                    <div style="font-size: 22px; font-weight: 700; letter-spacing: 1px; color: #ffffff;">
                      DISCIPLE
                    </div>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 36px 32px;">
                    <div style="display: inline-block; background-color: #f6ede3; color: #b8623b; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
                      ${affinity}% d'affinité spirituelle
                    </div>

                    <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #242220; line-height: 1.2;">
                      ${archetypeName}
                    </h1>

                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b705c; font-style: italic;">
                      Votre synthèse de profil et repères de travail sur soi
                    </p>

                    <div style="background-color: #fdfaf5; border-left: 4px solid #d4a373; padding: 16px 20px; border-radius: 0 12px 12px 0; margin-bottom: 28px;">
                      <p style="margin: 0; font-size: 14px; font-style: italic; line-height: 1.6; color: #3a3835;">
                        « Chaque membre du Corps de Christ a reçu une grâce particulière pour l'édification de tous. »
                      </p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #403d39; margin-bottom: 24px;">
                      Bonjour,<br><br>
                      Vous venez de compléter le test <strong>« Quel disciple de Jésus êtes-vous ? »</strong>. Votre profil révèle des résonances profondes avec la figure biblique de <strong>${archetypeName}</strong>.
                    </p>

                    <!-- Key highlights box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; border: 1px solid #ebd9c5; border-radius: 12px; padding: 18px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <div style="font-size: 13px; font-weight: 700; color: #242220; margin-bottom: 10px;">
                            Ce que cela révèle sur votre marche :
                          </div>
                          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4a4742; line-height: 1.6;">
                            <li style="margin-bottom: 6px;">Vos forces naturelles au service de la communauté</li>
                            <li style="margin-bottom: 6px;">Vos points de vigilance et angles morts à sanctifier</li>
                            <li style="margin-bottom: 0;">Vos complémentarités avec les autres tempéraments du Corps</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <a href="${resultUrl}" target="_blank" style="display: inline-block; background-color: #242220; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
                            Consulter mon analyse complète en ligne →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 12px; line-height: 1.5; color: #878278; text-align: center; margin: 0;">
                      Vous pouvez aussi y télécharger votre bilan récapitulatif au format PDF en un clic.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7f4ee; padding: 22px 30px; text-align: center; border-top: 1px solid #ebd9c5;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #6b705c; font-weight: 600;">
                      Disciple — Découverte des tempéraments bibliques
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #a19d95;">
                      Vous recevez cet e-mail suite à votre participation au test sur discipledejesus.netlify.app.<br>
                      Projet gratuit et indépendant au service de l'édification fraternelle.
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

    // Call Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromSender,
        to: [email],
        subject: `Votre archétype biblique : ${archetypeName} (${affinity}% d'affinité)`,
        html: emailHtml
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Erreur API Resend:', resendData);
      return new Response(JSON.stringify({ 
        success: false, 
        error: resendData.message || 'Erreur lors de l’envoi avec Resend',
        details: resendData
      }), {
        status: resendResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      id: resendData.id,
      message: 'Email envoyé avec succès via Resend !'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Erreur interne' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
