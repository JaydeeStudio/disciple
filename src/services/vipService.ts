import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface VipTokenData {
  token: string;
  recipientName: string;
  archetypeKey?: string;
  note?: string;
  used: boolean;
  useCount: number;
  usedAt?: any;
  createdAt: any;
}

/**
 * Generates a clean random token slug
 */
export function generateTokenSlug(name?: string): string {
  const cleanPrefix = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
    : 'vip';
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${cleanPrefix ? cleanPrefix + '_' : 'vip_'}${randomPart}`;
}

/**
 * Creates a single-use VIP token in Firestore
 */
export async function createVipToken(
  recipientName: string,
  archetypeKey?: string,
  note?: string
): Promise<{ token: string; link: string; data: VipTokenData }> {
  const cleanName = recipientName.trim() || 'Invité VIP';
  const token = generateTokenSlug(cleanName);
  const tokenRef = doc(db, 'vipTokens', token);

  const payload: any = {
    token,
    recipientName: cleanName,
    used: false,
    useCount: 0,
    createdAt: serverTimestamp()
  };

  if (archetypeKey) payload.archetypeKey = archetypeKey;
  if (note && note.trim()) payload.note = note.trim();

  await setDoc(tokenRef, payload);

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://discipledejesus.netlify.app';

  const link = `${baseUrl}/commande-succes?vip=${token}`;

  return {
    token,
    link,
    data: {
      ...payload,
      createdAt: new Date()
    }
  };
}

/**
 * Verifies the validity and status of a VIP token
 */
export async function verifyVipToken(token: string): Promise<{
  valid: boolean;
  used: boolean;
  data?: VipTokenData;
  error?: string;
}> {
  if (!token || !token.trim()) {
    return { valid: false, used: false, error: 'Token manquant' };
  }

  const cleanToken = token.trim();

  try {
    const tokenRef = doc(db, 'vipTokens', cleanToken);
    const snap = await getDoc(tokenRef);

    if (!snap.exists()) {
      return { valid: false, used: false, error: 'Lien VIP introuvable ou invalide.' };
    }

    const data = snap.data() as VipTokenData;

    if (data.used || data.useCount >= 1) {
      return { 
        valid: true, 
        used: true, 
        data, 
        error: 'Ce lien d\'invitation VIP à usage unique a déjà été utilisé.' 
      };
    }

    return { valid: true, used: false, data };
  } catch (err: any) {
    console.error('Erreur lors de la vérification du token VIP :', err);
    return { valid: false, used: false, error: 'Erreur de connexion au serveur de vérification.' };
  }
}

/**
 * Consumes / redeems a single-use VIP token
 */
export async function redeemVipToken(token: string): Promise<boolean> {
  if (!token || !token.trim()) return false;
  const cleanToken = token.trim();

  try {
    const tokenRef = doc(db, 'vipTokens', cleanToken);
    await updateDoc(tokenRef, {
      used: true,
      useCount: 1,
      usedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error('Erreur lors de la consommation du token VIP :', err);
    return false;
  }
}

/**
 * Fetches all VIP tokens for management
 */
export async function getAllVipTokens(): Promise<VipTokenData[]> {
  try {
    const q = query(collection(db, 'vipTokens'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as VipTokenData);
  } catch (err) {
    console.error('Erreur listing des tokens VIP :', err);
    return [];
  }
}

/**
 * Deletes a VIP token
 */
export async function deleteVipToken(token: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'vipTokens', token));
    return true;
  } catch (err) {
    console.error('Erreur suppression token VIP :', err);
    return false;
  }
}
