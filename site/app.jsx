/* global React, Nav, Hero, TheLeakSection, ROISection, ServicesSection, ProcessSection, TestimonialsSection, ClosingSection, Footer, FloatingAgent */

function App() {
  const onBook = () => {
    const el = document.getElementById('closing');
    if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' });
  };
  return (
    <div className="uf-page upframe">
      <Nav onBook={onBook} />
      <main>
        <Hero onBook={onBook} />
        <TheLeakSection />
        <ROISection onBook={onBook} />
        <ServicesSection />
        <ProcessSection />
        <TestimonialsSection />
        <ClosingSection onBook={onBook} />
      </main>
      <Footer />
      <FloatingAgent onBook={onBook} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
