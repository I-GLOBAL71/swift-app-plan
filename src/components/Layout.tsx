import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SearchBar } from "./SearchBar";
import { CategoriesBar } from "./CategoriesBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
        <CategoriesBar />
      </div>
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;