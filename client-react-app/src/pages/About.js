const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About Us</h1>

      <div className="prose max-w-none">
        <p className="text-gray-700 mb-6">
          The Zakat Platform is a transparent, secure, and community-driven platform
          designed to facilitate charitable giving and zakat distribution. We connect
          donors with verified cases of individuals and families in need of financial
          assistance.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          To create a transparent and efficient system for zakat and charity distribution,
          ensuring that donations reach those who need them most while maintaining
          accountability and trust.
        </p>

        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">1. Case Submission</h3>
            <p className="text-gray-700">
              Applicants submit their cases with detailed information and supporting
              documents.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">2. Admin Review</h3>
            <p className="text-gray-700">
              Cases are reviewed by administrators to ensure authenticity and need.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">3. Peer Review</h3>
            <p className="text-gray-700">
              Approved cases go through community peer review for additional verification.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">4. Public Listing</h3>
            <p className="text-gray-700">
              Verified cases are listed publicly for donors to browse and contribute.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">5. Donation & Verification</h3>
            <p className="text-gray-700">
              Donors pledge donations, upload payment proofs, and admins verify
              transactions.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Privacy & Security</h2>
        <p className="text-gray-700 mb-6">
          We take privacy seriously. Sensitive information like CNIC numbers, exact
          addresses, and family member details are never displayed publicly. Only
          essential information needed for verification is shared with administrators.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Transparency</h2>
        <p className="text-gray-700 mb-6">
          All donations are tracked, and donors can see exactly where their contributions
          are going. Case progress is updated in real-time, and all verified donations
          are publicly recorded.
        </p>
      </div>
    </div>
  );
};

export default About;

