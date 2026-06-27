# Plan — Portail VacciConseil

Création d'un portail sécurisé "VacciConseil" qui sert de porte d'entrée vers VacciCheck (https://vaccicheckapp.netlify.app/) et centralise les ressources vaccination/santé voyage (INSPQ, PIQ).

## 1. Backend — Lovable Cloud (Supabase géré)
Activation de Lovable Cloud pour gérer authentification, base de données et sécurité.

**Authentification**
- Email + mot de passe (avec auto-confirm activé pour démo, désactivable plus tard)
- Inscription, connexion, réinitialisation de mot de passe (page `/reset-password`)
- Les mots de passe sont hashés par Supabase Auth — **personne**, y compris les admins, ne peut les voir

**Tables**
- `profiles` : id (FK auth.users), full_name, profession (enum: medecin/pharmacien/infirmiere/etudiant/autre), license_number, created_at
- `user_roles` : table séparée (sécurité), role enum (`admin`, `user`) + fonction `has_role()` SECURITY DEFINER
- Trigger auto-création de profil à l'inscription
- RLS : utilisateurs voient/modifient leur propre profil ; admins voient tous les profils

**Comptes admin pré-créés** via migration SQL (seed)
- guillaume.page09@gmail.com / admin
- noemie.duval@hotmail.com / admin
- Rôle `admin` assigné dans `user_roles`

**Réinitialisation par admin** : un admin déclenche `supabase.auth.admin.generateLink({ type: 'recovery' })` via une server function protégée — l'usager reçoit un lien par courriel pour choisir son nouveau mot de passe (l'admin ne le voit jamais).

## 2. Pages (routes)

```
/              Landing publique — logo, présentation, CTA connexion/inscription
/auth          Connexion + inscription (onglets)
/forgot-password   Demande de réinitialisation
/reset-password    Nouveau mot de passe (depuis lien email)
/_authenticated/
  /dashboard   Page d'accueil après login : 3 cartes
                 - VacciCheck (lien externe)
                 - INSPQ Santé voyage (lien externe)
                 - PIQ — Protocole d'immunisation (lien externe)
  /profile     Gestion : nom complet, profession, n° licence
  /admin       (admins only) Liste des usagers + bouton "Envoyer lien de réinit"
```

## 3. Design
- Palette inspirée du logo : dégradé bleu→violet (`#3B82F6` → `#8B5CF6`)
- Tokens sémantiques dans `src/styles.css` (oklch), ombres douces, glassmorphism léger
- Typo moderne (Inter)
- Logo VacciConseil intégré comme asset, affiché sur landing + auth + header

## 4. Hébergement Netlify
Le projet TanStack Start est déployable. Je documenterai dans un court README la commande build et le dossier de sortie. Note : la version "site statique pur" sur Netlify nécessite quelques ajustements ; alternativement le portail peut rester sur Lovable (URL `*.lovable.app`) qui simplifie l'auth backend. Je recommande **publication via Lovable** pour éviter de gérer séparément les variables Supabase sur Netlify — à confirmer.

## 5. Abonnements payants (futur)
Préparation seulement, pas d'implémentation cette itération :
- Colonne `subscription_tier` (`free`/`pro`) sur `profiles`
- Lovable supporte **Stripe** et **Paddle** intégrés (paiements sans clé API à gérer). Quand tu seras prêt, on activera Stripe ou Paddle et on ajoutera une page `/pricing` + gating de fonctionnalités selon `subscription_tier`.

## Détails techniques
- TanStack Start + TanStack Router (file-based)
- Supabase via Lovable Cloud (clients : browser, `requireSupabaseAuth` middleware, `supabaseAdmin` pour actions admin)
- RLS strict, rôles dans table séparée (jamais sur `profiles`)
- Validation Zod sur tous les formulaires
- shadcn/ui pour les composants

## Questions avant de construire
1. **Hébergement** : OK pour publier via Lovable (plus simple), ou tu veux absolument Netlify ?
2. **Inscription** : ouverte à tous, ou approbation admin requise avant accès ?
3. **Logo** : je l'ajoute comme asset du projet — OK ?