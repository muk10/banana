import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Charity Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connecting donors with those in need
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/cases"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Browse Cases
          </Link>
          <Link
            to="/zakat-calculator"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Zakat Calculator
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">For Donors</h3>
          <p className="text-gray-600 mb-4">
            Browse verified cases and make secure donations to help those in need.
          </p>
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Become a Donor →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">For Applicants</h3>
          <p className="text-gray-600 mb-4">
            Submit your case for review and receive financial assistance from our community.
          </p>
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Apply for Aid →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Transparency</h3>
          <p className="text-gray-600 mb-4">
            All cases are verified through peer review and admin approval for maximum transparency.
          </p>
          <Link
            to="/about"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

