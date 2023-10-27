import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";

function App() {
  return (
    <div>
      <a href="#terms-of-service">Jump to terms of service</a>
      <PrivacyPolicy />
      <div id="terms-of-service">
        <TermsOfService />
      </div>
    </div>
  );
}

export default App;
