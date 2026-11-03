import React, { useState } from 'react';
import { ARCHETYPES } from '../data/archetypes';
import { Mail, Smartphone, Monitor, Copy, Check, ExternalLink, Sparkles, Send, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmailPreview() {
  const [selectedKey, setSelectedKey] = useState<string>('jean');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [userName, setUserName] = useState<string>('David');
  const [score, setScore] = useState<number>(94);
  const [copied, setCopied] = useState<boolean>(false);
  const [testEmail, setTestEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);

function getSilhouetteSvg(characterKey: string, gender: string = 'M') {
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

  const archetype = ARCHETYPES[selectedKey] || ARCHETYPES['jean'];

  const greeting = userName.trim() ? `Bonjour ${userName.trim()},` : `Bonjour,`;
  const verseText = archetype.biblicalVerse || "Chaque membre du Corps a reçu une grâce particulière pour l'édification de tous.";
  const resultUrl = `https://discipledejesus.netlify.app/resultats/${archetype.key}?score=${score}${userName ? `&nom=${encodeURIComponent(userName)}` : ''}`;
  const directPdfUrl = `${resultUrl}&pdf=1`;
  const silhouetteSvg = getSilhouetteSvg(archetype.key, archetype.gender);

  const generatedHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre synthèse de profil : ${archetype.name}</title>
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
          
          <!-- HEADER AVEC ICÔNE OFFICIELLE DU SITE SUR FOND SOMBRE & HAUTEUR OPTIMISÉE -->
          <tr>
            <td style="background-color: #242220; padding: 22px 24px 20px; text-align: center; border-bottom: 2px solid #d4a373;">
              
              <!-- ICÔNE ÉTOILE D'AURORE / BOUSSOLE SPÉCIALE FOND SOMBRE -->
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

          <!-- CONTENU DU MESSAGE CENTRÉ -->
          <tr>
            <td style="padding: 34px 30px 28px;">
              
              <!-- 1. BADGE D'AFFINITÉ CENTRÉ -->
              <div style="text-align: center; margin-bottom: 16px;">
                <span style="display: inline-block; background-color: #fcf1eb; color: #b8623b; border: 1px solid #f2cfbf; padding: 5px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  ✦ ${score}% de résonance
                </span>
              </div>

              <!-- 2. SILHOUETTE SVG OFFICIELLE DE L'ARCHÉTYPE -->
              <div style="text-align: center; margin-bottom: 16px;">
                ${silhouetteSvg}
              </div>

              <!-- 3. TITRE DU PERSONNAGE CENTRÉ -->
              <h1 class="serif-title" style="text-align: center; font-family: 'Cinzel', Georgia, serif; margin: 0 0 6px 0; font-size: 32px; font-weight: 700; color: #242220; line-height: 1.15;">
                ${archetype.name}
              </h1>

              <!-- 4. SOUS-TITRE DU PERSONNAGE CENTRÉ -->
              <p style="text-align: center; margin: 0 0 20px 0; font-size: 16px; color: #6b705c; font-style: italic; font-weight: 500;">
                ${archetype.title}
              </p>

              <!-- 5. VERSET BIBLIQUE CENTRÉ -->
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

              <!-- TEXTE D'ACCUEIL -->
              <p style="font-size: 15px; line-height: 1.6; color: #403d39; margin-bottom: 24px; text-align: left;">
                ${greeting}<br><br>
                Comme convenu lors de votre test <strong>« Quel disciple de Jésus êtes-vous ? »</strong>, voici votre synthèse personnalisée.
              </p>

              <!-- 1ER BOUTON : TÉLÉCHARGER LE PDF (ÉPURÉ, SANS EMOJI NI LABELS REDONDANTS) -->
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

              <!-- ENCADRÉ DES POINTS CLÉS -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; border: 1px solid #ebd9c5; border-radius: 16px; padding: 20px; margin-bottom: 34px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 700; color: #242220; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Ce que révèle votre posture :
                    </div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 13.5px; color: #4a4742; line-height: 1.5;">
                          <span style="color: #2e7d32; font-weight: bold; margin-right: 8px;">✓</span>
                          <strong>Forces naturelles :</strong> vos élans et vos dons spontanés au service des autres
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13.5px; color: #4a4742; line-height: 1.5;">
                          <span style="color: #b8623b; font-weight: bold; margin-right: 8px;">✦</span>
                          <strong>Angles morts :</strong> les pièges de fatigue ou de repli à surveiller avec lucidité
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13.5px; color: #4a4742; line-height: 1.5;">
                          <span style="color: #d4a373; font-weight: bold; margin-right: 8px;">◆</span>
                          <strong>Complémentarités :</strong> les profils qui vous équilibrent dans le Corps
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BLOC UPSELL DU GUIDE COMPLET (36 PAGES) AVEC MOCKUPS VISUELS ET CHIFFRES HARMONISÉS EN OR -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1e1c1a; border-radius: 20px; overflow: hidden; margin-bottom: 12px; border: 1px solid #d4a373;">
                <tr>
                  <td style="padding: 30px 24px; text-align: left; color: #ffffff;">
                    
                    <div style="margin-bottom: 8px;">
                      <span style="display: inline-block; background-color: rgba(212, 163, 115, 0.2); color: #d4a373; border: 1px solid rgba(212, 163, 115, 0.4); padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Dossier complet d'approfondissement • 36 pages
                      </span>
                    </div>

                    <h2 class="serif-title" style="font-family: 'Cinzel', Georgia, serif; font-size: 22px; line-height: 1.3; color: #ffffff; margin: 0 0 10px 0;">
                      Passez à la vitesse supérieure dans votre travail sur soi
                    </h2>

                    <p style="font-size: 13px; line-height: 1.6; color: #d8d3cd; margin: 0 0 18px 0;">
                      Le test vous a offert un aperçu de vos équilibres. Ce guide individuel complet (36 pages) a été structuré comme un manuel pratique de travail sur soi :
                    </p>

                    <!-- MOCKUP VISUEL DU LIVRET AVEC LES VRAIES PAGES DU DOSSIER -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 22px;">
                      <tr>
                        <td align="center">
                          <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto; max-width: 500px; width: 100%;">
                            <tr>
                              <!-- Page 1 : Couverture -->
                              <td style="width: 33.33%; padding: 0 5px; vertical-align: top; text-align: center;">
                                <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1.5px solid #d4a373; box-shadow: 0 6px 16px rgba(0,0,0,0.5);">
                                  <img 
                                    src="/images/guide-preview/couverture.jpg" 
                                    alt="Couverture du dossier 36 pages" 
                                    width="145" 
                                    style="display: block; width: 100%; height: auto; border: 0;"
                                  />
                                </div>
                                <div style="font-size: 11px; color: #d4a373; font-weight: 700; margin-top: 7px; line-height: 1.2;">
                                  Couverture
                                </div>
                                <div style="font-size: 9.5px; color: #a19d95; margin-top: 1px;">
                                  Dossier relié (Page 1)
                                </div>
                              </td>

                              <!-- Page 2 : Roue polaire radar -->
                              <td style="width: 33.33%; padding: 0 5px; vertical-align: top; text-align: center;">
                                <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(212, 163, 115, 0.4); box-shadow: 0 6px 16px rgba(0,0,0,0.5);">
                                  <img 
                                    src="/images/guide-preview/page-radar.jpg" 
                                    alt="Roue des composantes et diagramme polaire" 
                                    width="145" 
                                    style="display: block; width: 100%; height: auto; border: 0;"
                                  />
                                </div>
                                <div style="font-size: 11px; color: #d4a373; font-weight: 700; margin-top: 7px; line-height: 1.2;">
                                  Roue Polaire
                                </div>
                                <div style="font-size: 9.5px; color: #a19d95; margin-top: 1px;">
                                  8 énergies (Page 4)
                                </div>
                              </td>

                              <!-- Page 3 : Bilan 9 composantes et carte 2D -->
                              <td style="width: 33.33%; padding: 0 5px; vertical-align: top; text-align: center;">
                                <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(212, 163, 115, 0.4); box-shadow: 0 6px 16px rgba(0,0,0,0.5);">
                                  <img 
                                    src="/images/guide-preview/page-synthese.jpg" 
                                    alt="Grand récapitulatif visuel et cartographie 2D" 
                                    width="145" 
                                    style="display: block; width: 100%; height: auto; border: 0;"
                                  />
                                </div>
                                <div style="font-size: 11px; color: #d4a373; font-weight: 700; margin-top: 7px; line-height: 1.2;">
                                  Cartographie 2D
                                </div>
                                <div style="font-size: 9.5px; color: #a19d95; margin-top: 1px;">
                                  Planche bilan (Page 35)
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- GRILLE DES 4 MODULES : CHIFFRES HARMONISÉS EN OR (#d4a373) -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 6px 4px 6px 0; vertical-align: top; font-size: 12px; color: #e6e1da; line-height: 1.4;">
                          <strong style="color: #d4a373; font-weight: 800;">01.</strong> Décodage de vos 5 dimensions
                        </td>
                        <td style="padding: 6px 0 6px 4px; vertical-align: top; font-size: 12px; color: #e6e1da; line-height: 1.4;">
                          <strong style="color: #d4a373; font-weight: 800;">02.</strong> Dynamiques relationnelles & communication
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 4px 6px 0; vertical-align: top; font-size: 12px; color: #e6e1da; line-height: 1.4;">
                          <strong style="color: #d4a373; font-weight: 800;">03.</strong> Vigilances & angles morts sous pression
                        </td>
                        <td style="padding: 6px 0 6px 4px; vertical-align: top; font-size: 12px; color: #e6e1da; line-height: 1.4;">
                          <strong style="color: #d4a373; font-weight: 800;">04.</strong> Grille concrète de progression
                        </td>
                      </tr>
                    </table>

                    <!-- ENCADRÉ PRIX & BOUTON STRIPE DIRECT -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 16px;">
                      <tr>
                        <td style="text-align: left; vertical-align: middle;">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2ecc71; font-weight: 700;">
                            Offre de lancement
                          </div>
                          <div style="font-size: 26px; font-weight: 700; color: #ffffff; line-height: 1.1;">
                            19 € <span style="font-size: 13px; text-decoration: line-through; color: #8f8a85; font-weight: normal;">29 €</span>
                          </div>
                          <div style="font-size: 10px; color: #a19d95;">
                            Paiement unique • Accès immédiat
                          </div>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                          <a href="https://buy.stripe.com/7sY8wP6Xj2ta06oexaeIw00" target="_blank" style="display: inline-block; background-color: #b8623b; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap;">
                            Obtenir mon dossier (19 €) →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top: 12px; font-size: 11px; color: #a19d95; text-align: center;">
                      🔒 Paiement sécurisé SSL Stripe • Téléchargement PDF immédiat
                    </div>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER SANS MARQUE TIÈRCE -->
          <tr>
            <td style="background-color: #f7f4ee; padding: 22px 30px; text-align: center; border-top: 1px solid #ebd9c5;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b705c; font-weight: 700;">
                Quel disciple de Jésus êtes-vous ?
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #878278;">
                Découverte des figures bibliques, des postures intérieures et du travail sur soi.
              </p>
              <p style="margin: 0; font-size: 10px; color: #a19d95; line-height: 1.5;">
                Vous recevez cet e-mail suite à votre demande sur discipledejesus.netlify.app.<br>
                <em>Cet e-mail est un message d'envoi automatique. Pour préserver la gratuité de la plateforme, les réponses directes ne sont pas traitées de façon continue.</em>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const copyHtmlCode = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail.trim(),
          archetypeKey: archetype.key,
          archetypeName: archetype.name,
          archetypeTitle: archetype.title,
          biblicalVerse: archetype.biblicalVerse,
          userName: userName.trim() || 'Ami(e)',
          affinity: score,
          siteUrl: window.location.origin
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendResult({ success: true, msg: `E-mail de test expédié avec succès vers ${testEmail} !` });
      } else {
        setSendResult({ success: false, msg: data.message || data.error || "Impossible d'envoyer (vérifiez vos variables Netlify)." });
      }
    } catch (err: any) {
      setSendResult({ success: false, msg: err.message || "Erreur réseau lors de l'envoi." });
    } finally {
      setIsSending(false);
    }
  };

  const sampleCharacters = ['jean', 'pierre', 'marie_magdala', 'paul', 'barnabe', 'marthe', 'thomas'];

  return (
    <div className="min-h-screen bg-[#f7f4ee] py-8 px-4 sm:px-6 text-brand-charcoal">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-ochre/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/" className="inline-flex items-center gap-1 text-xs text-brand-terracotta hover:underline font-bold">
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour au site
              </Link>
              <span className="text-brand-charcoal/30">•</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-ochre/15 text-brand-charcoal text-[11px] font-bold uppercase tracking-wider">
                Studio E-mail
              </span>
            </div>
            <h1 className="font-display text-3xl text-brand-charcoal font-bold">
              Visualiseur de l'e-mail de synthèse
            </h1>
            <p className="text-sm text-brand-charcoal/70">
              Vérifiez le rendu exact, personnalisez les variables et testez l'envoi vers votre boîte.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/email-preview.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-brand-ochre/30 hover:bg-brand-ochre/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Ouvrir HTML brut</span>
            </a>
            <button
              onClick={copyHtmlCode}
              className="px-4 py-2 bg-brand-charcoal hover:bg-brand-terracotta text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Code HTML copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-brand-ochre" />
                  <span>Copier le HTML</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-white border border-brand-ochre/25 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Personnage selector */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                Figure biblique
              </label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-ochre/30 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
              >
                {sampleCharacters.map((k) => (
                  <option key={k} value={k}>
                    {ARCHETYPES[k]?.name || k} — {ARCHETYPES[k]?.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                Prénom du destinataire
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex : David"
                className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-ochre/30 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
              />
            </div>

            {/* Score */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                Affinité ({score}%)
              </label>
              <input
                type="range"
                min="70"
                max="99"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full accent-brand-terracotta cursor-pointer"
              />
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-brand-charcoal text-white shadow-sm'
                    : 'bg-brand-bg hover:bg-brand-ochre/15 text-brand-charcoal'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Bureau</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-brand-charcoal text-white shadow-sm'
                    : 'bg-brand-bg hover:bg-brand-ochre/15 text-brand-charcoal'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

          </div>
        </div>

        {/* Interactive Preview Container */}
        <div className="flex justify-center mb-12">
          <div
            className={`transition-all duration-300 w-full ${
              deviceView === 'mobile' ? 'max-w-[420px]' : 'max-w-[700px]'
            }`}
          >
            {/* Fake Email Client Window Frame */}
            <div className="bg-[#242220] rounded-t-2xl px-4 py-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-white/60 text-xs font-mono ml-2">
                  Boîte de réception • contact.discipledejesus@gmail.com
                </span>
              </div>
              <span className="text-[11px] text-brand-ochre font-bold uppercase tracking-wider">
                {deviceView === 'mobile' ? 'Aperçu Mobile (375px)' : 'Aperçu Boîte Mail'}
              </span>
            </div>

            {/* Email Meta bar */}
            <div className="bg-[#ebe4d8] px-5 py-3 border-x border-[#ded5c7] text-xs space-y-1">
              <div>
                <span className="text-brand-charcoal/60 font-medium">De : </span>
                <span className="font-bold text-brand-charcoal">"Quel disciple suis-je" &lt;contact.discipledejesus@gmail.com&gt;</span>
              </div>
              <div>
                <span className="text-brand-charcoal/60 font-medium">Objet : </span>
                <span className="font-bold text-brand-charcoal">Votre figure biblique : {archetype.name} ({score}% de résonance)</span>
              </div>
            </div>

            {/* Real rendered HTML email iframe */}
            <div className="bg-[#f7f4ee] p-4 sm:p-6 border-x border-b border-[#ded5c7] rounded-b-2xl shadow-xl overflow-hidden">
              <iframe
                title="Email Preview"
                srcDoc={generatedHtml}
                className="w-full h-[760px] border-0 rounded-xl bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Real Test Email Dispatch Box */}
        <div className="bg-gradient-to-br from-white to-[#fbf7f0] border border-brand-ochre/30 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-charcoal text-brand-ochre flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-charcoal">
                Tester l'envoi réel vers votre propre adresse
              </h3>
              <p className="text-xs text-brand-charcoal/70">
                Entrez votre adresse personnelle pour recevoir ce modèle directement dans votre boîte Gmail / Outlook.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-3 mt-4">
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="votre.email.perso@gmail.com"
              className="flex-1 px-4 py-2.5 bg-white border border-brand-ochre/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
            />
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-brand-terracotta hover:bg-[#a0522f] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSending ? 'Envoi en cours...' : "M'envoyer l'e-mail test"}
            </button>
          </form>

          {sendResult && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs font-semibold border ${
                sendResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {sendResult.msg}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
