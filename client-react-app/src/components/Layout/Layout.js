import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 text-center">
          <p>&copy; 2024 Charity Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

