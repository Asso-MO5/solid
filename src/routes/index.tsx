import { type VoidComponent } from "solid-js";

const Home: VoidComponent = () => {
  return (
    <main class="flex flex-col items-center justify-center relative">
      <div class="absolute inset-0 overflow-y-auto flex flex-col items-center">
        ici le contenu
      </div>
    </main>
  );
};

export default Home;