'use client';

import React from 'react';

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 legal-content">
      <h1 className="text-3xl font-bold text-white mb-8">Conditions Générales de Vente (CGV)</h1>
      
      <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
        <p><em>Dernière mise à jour : 1 Octobre 2024</em></p>

        <h2>1. Objet</h2>
        <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Bob-Shop et toute personne passant commande sur le site. En validant sa commande, le client déclare accepter sans réserve les termes de ladite commande ainsi que l'intégralité des présentes CGV.</p>

        <h2>2. Produits et Mode de Distribution (Transparence)</h2>
        <p>Bob-Shop agit en tant qu'intermédiaire commerçant. Les produits proposés sur le site sont expédiés directement depuis les entrepôts de nos fournisseurs partenaires situés en Europe et en Asie (Modèle dit de "Livraison Directe" ou "Dropshipping").</p>
        <p>En conséquence, en passant commande sur notre site, le client est l'importateur du produit concerné. Des droits de douane ou autres taxes locales sont susceptibles d'être exigibles. Ces droits et sommes ne relèvent pas du ressort de Bob-Shop. Ils seront à la charge du client et relèvent de son entière responsabilité.</p>

        <h2>3. Prix</h2>
        <p>Les prix de nos produits sont indiqués en euros toutes taxes comprises (TTC), sauf indication contraire et hors frais de traitement et d'expédition.</p>

        <h2>4. Livraison</h2>
        <p>Les produits sont livrés à l'adresse de livraison indiquée au cours du processus de commande. Les délais indiqués sont des délais moyens habituels et correspondent aux délais de traitement et de livraison.</p>
        <p>Délais moyens constatés : 7 à 15 jours ouvrés.</p>

        <h2>5. Droit de rétractation</h2>
        <p>Conformément aux dispositions de l'article L.121-21 du Code de la Consommation, vous disposez d'un délai de rétractation de 14 jours à compter de la réception de vos produits pour exercer votre droit de rétraction sans avoir à justifier de motifs ni à payer de pénalité.</p>
        <p>Les retours sont à effectuer dans leur état d'origine et complets (emballage, accessoires, notice). Les frais de retour sont à la charge du client.</p>

        <h2>6. Garantie</h2>
        <p>Tous nos produits bénéficient de la garantie légale de conformité et de la garantie des vices cachés, prévues par les articles 1641 et suivants du Code civil.</p>
      </div>
    </div>
  );
}