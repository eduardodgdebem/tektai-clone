import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Render } from "./pages/Render";
import { SharePage } from "./pages/Share";
import { ModelGallery } from "./pages/ModelsGallery";
import { Theme } from "@radix-ui/themes";
import { Header } from "./components/Header";

const App = () => {
  return (
    <Theme appearance="dark">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<ModelGallery />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/share/:modelId" element={<SharePage />} />
          <Route path="/models" element={<ModelGallery />} />
          <Route path="/render" element={<Render />} />
          <Route path="/render/:modelId" element={<Render />} />
        </Routes>
      </Router>
    </Theme>
  );
};

export default App;
