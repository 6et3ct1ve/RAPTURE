import Header from './Header';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <>
      <div className="container">
        <Header />
        <main>{children}</main>
      </div>
      <Footer />
    </>
  );
}

export default Layout;