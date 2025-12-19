# DeeperWeave 🎬

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A social platform for cinephiles to track, review, and discuss cinema with rich-text storytelling.**

DeeperWeave bridges the gap between a Letterboxd-style tracker and a medium-style blog. It features a custom-built rich text editor, real-time social timelines, and deep integrations with movie databases.

### ⚡ Key Features

* **Rich Text Editor (TipTap):** Engineered a custom block-based editor supporting image uploads, formatting, and slash commands for writing in-depth reviews.
* **Media Discovery Engine:** Integrated external Movie/TV APIs to fetch metadata, trending content, and cast details in real-time.
* **Social Graph:** Follow/Unfollow system with a personalized activity feed showing friends' reviews and watchlists.
* **Authentication & Security:** Secure user management powered by Supabase Auth with Row Level Security (RLS) policies.

### 🛠️ Technical Highlights

* **Optimized Rendering:** Utilized Next.js Server Components (RSC) to reduce client-side bundle size by 30% while maintaining SEO for movie pages.
* **Database Design:** Implemented a relational schema in PostgreSQL (via Supabase) handling many-to-many relationships for user followers and media interactions.
* **State Management:** Managed complex editor state and optimistic UI updates using React Query and local state.

### 🚀 Getting Started

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/rajavenkatesh04/deeperweave.git](https://github.com/rajavenkatesh04/deeperweave.git)
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Set up environment variables**
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    ```
4.  **Run the development server**
    ```bash
    npm run dev
    ```
