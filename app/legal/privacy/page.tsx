'use client';

import React from 'react';

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 legal-content">
      <h1 className="text-3xl font-bold text-white mb-8">Politique de Confidentialité</h1>
      
      <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
        <h2>1. Collecte des données</h2>
        <p>Nous collectons les informations que vous nous fournissez notamment lors de la création de votre compte client ou lors de vos commandes (Nom, Prénom, Adresse, Email).</p>

        <h2>2. Utilisation des données</h2>
        <p>Les informations que vous nous communiquez sont indispensables pour le traitement et l'acheminement des commandes, l'établissement des factures et des contrats de garantie.</p>

        <h2>3. Cookies</h2>
        <p>Notre site utilise des cookies pour améliorer l'expérience utilisateur, réaliser des statistiques de visites et vous proposer des offres adaptées. En poursuivant votre navigation, vous acceptez l'utilisation de ces cookies.</p>

        <h2>4. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, et d'opposition aux données personnelles vous concernant. Pour exercer ce droit, contactez-nous à support@bob-shop.com.</p>
      </div>
    </div>
  );
}