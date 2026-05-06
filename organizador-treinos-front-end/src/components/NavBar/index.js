import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";

function NavBar() {
  const { user, signout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <Navbar
      expand="lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0",
      }}
    >
      <Container>
        <Navbar.Brand
          href="/home"
          style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}
        >
          💪 Treinos
        </Navbar.Brand>

        {/* Always visible on mobile: theme toggle + user */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", marginRight: 8 }}>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Mudar para Light" : "Mudar para Dark"}
            style={{
              background: "none",
              border: "none",
              fontSize: 16,
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: 6,
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--nav-active-bg)",
              color: "var(--accent)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          {firstName && (
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {firstName}
            </span>
          )}
        </div>

        <Navbar.Toggle aria-controls="nav-main" />

        {/* Hamburger content: nav links + sair */}
        <Navbar.Collapse id="nav-main">
          <Nav className="me-auto" style={{ gap: 4 }}>
            <Nav.Link href="/home" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Dashboard
            </Nav.Link>
            <Nav.Link href="/myworkouts" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Meus Treinos
            </Nav.Link>
            <Nav.Link href="/account" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Conta
            </Nav.Link>
          </Nav>

          <div style={{ padding: "8px 0" }}>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 12,
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              Sair
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
