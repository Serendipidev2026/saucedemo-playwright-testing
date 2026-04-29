# 🧪 Test technique QA junior — “Checkout jusqu’à confirmation” (SauceDemo)

## 🎯 Objectif

Évaluer ta capacité à tester un parcours utilisateur complet sur un site e-commerce :

connexion → ajout de produits → panier → checkout → **confirmation de commande** (“Thank you for your order!”).

---

## 🔧 Environnement & accès

- Site à tester : [https://www.saucedemo.com](https://www.saucedemo.com/)
- Identifiants de test :
    - **username** : `standard_user`
    - **password** : `secret_sauce`

---

## 📦 Parcours à tester

**Objectif final :** valider qu’un utilisateur peut passer une commande complète sans erreur.

### Scénario principal

1. Se connecter avec `standard_user` / `secret_sauce`.
2. Sur la page **Products**, ajouter **au moins deux articles** au panier.
3. Ouvrir le **Cart** et vérifier que le contenu, les quantités et les prix sont corrects.
4. Cliquer sur **Checkout**, puis renseigner les champs :
    - *First Name*
    - *Last Name*
    - *Postal Code*
5. Vérifier la page **Overview** :
    - Les bons produits sont affichés
    - Les montants **Item total**, **Tax** et **Total** sont présents
    - Le **Total** correspond bien à la somme de *Item total + Tax*
6. Cliquer sur **Finish** et vérifier la page de confirmation :
    - Message : “Thank you for your order!”
    - Présence du visuel de confirmation
    - Bouton **Back Home** visible et fonctionnel

---

## 🧩 Ce que tu dois livrer

### 1. Mini plan de test (1 page max)

- Portée : quelles pages et actions sont concernées.
- Hypothèses et limites éventuelles.
- Risques ou contraintes identifiés.

### 2. Vérifications attendues

- Le **compteur du panier** affiche le bon nombre d’articles.
- Les **prix unitaires** sont cohérents avec le **sous-total**.
- Le **Total** inclut bien la **Taxe**.
- Le **message de confirmation** s’affiche clairement après validation.
- Le **bouton Back Home** ramène bien à la liste des produits.

---
