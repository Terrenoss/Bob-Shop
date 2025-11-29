'use client';

import React from 'react';

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 legal-content">
      <h1 className="text-3xl font-bold text-white mb-8">Mentions Légales</h1>
      
      <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
        <h2>1. Éditeur du site</h2>
        <p>Le site <strong>Bob-Shop</strong> est édité par :</p>
        <ul>
            <li><strong>Raison sociale :</strong> Bob-Shop France SAS</li>
            <li><strong>Siège social :</strong> 10 Rue de la Paix, 75000 Paris, France (Adresse fictive de démo)</li>
            <li><strong>SIRET :</strong> 000 000 000 00000</li>
            <li><strong>Directeur de la publication :</strong> M. Bob Admin</li>
            <li><strong>Contact :</strong> support@bob-shop.com</li>
        </ul>

        <h2>2. Hébergement</h2>
        <p>Le site est hébergé par :</p>
        <ul>
            <li><strong>Hébergeur :</strong> Google Cloud Platform / Vercel (Simulé)</li>
            <li><strong>Adresse :</strong> 8 rue de Londres, 75009 Paris</li>
        </ul>

        <h2>3. Propriété intellectuelle</h2>
        <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.</p>
      </div>
    </div>
  );
}