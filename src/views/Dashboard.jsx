import React, { useState, useEffect, useRef, Component } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Spinner,
} from "react-bootstrap";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import { FaShieldAlt, FaBug, FaLightbulb, FaFilePdf } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ChartTooltip,
  Legend
);

const owaspMap = {
  "Broken Access Control": {
    label: "Contrôle d'accès inadéquat",
    description: "Des utilisateurs peuvent accéder à des ressources non autorisées.",
    link: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
  },
  "Cryptographic Failures": {
    label: "Défaillances cryptographiques",
    description: "Données non chiffrées ou mal protégées.",
    link: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/",
  },
  "Security Misconfiguration": {
    label: "Configuration de sécurité incorrecte",
    description: "Paramètres par défaut ou services inutiles activés.",
    link: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/",
  },
  "Identification and Authentication Failures": {
    label: "Identification et authentification non sécurisées",
    description: "Mauvaise gestion des identifiants et sessions.",
    link: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/",
  },
  "API Insecurity": {
    label: "Insécurité des API",
    description: "APIs vulnérables sans contrôle ou protection suffisante.",
    link: "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_(SSRF)/",
  },
};

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-danger"><h3>Erreur de rendu</h3><p>{this.state.error?.message}</p></div>;
    }
    return this.props.children;
  }
}

const dashboardStyles = `
  .dashboard-card {
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  .dashboard-card:hover {
    transform: translateY(-5px);
  }
  .export-btn {
    background-color: #007bff;
    padding: 10px 20px;
    font-weight: 500;
    color: white;
    border: none;
  }
  .export-btn:hover {
    background-color: #0056b3;
  }
  .recommendation-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 1rem;
    font-weight: 500;
  }
  .recommendation-item input[type="checkbox"] {
    margin-right: 10px;
    width: 18px;
    height: 18px;
  }
  .recommendation-note {
    margin-left: 28px;
    margin-top: 5px;
    font-size: 0.9rem;
  }
`;

function Dashboard() {
  const [riskScore, setRiskScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [owaspDetected, setOwaspDetected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recNotes, setRecNotes] = useState({});
  const pieChartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur');
        setRiskScore(data.riskScore);
        setRecommendations(data.recommendations);
        setOwaspDetected(data.owaspIssues);
      } catch (err) {
        setError("Erreur de chargement : " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieChartData = {
    labels: [`Score ${riskScore || 0}%`, `À améliorer ${100 - (riskScore || 0)}%`],
    datasets: [{
      data: [riskScore || 0, 100 - (riskScore || 0)],
      backgroundColor: ["#007bff", "#e9ecef"],
      hoverBackgroundColor: ["#0056b3", "#dee2e6"],
    }],
  };

  const tips = [
    "💡 Activez les alertes de connexion suspecte.",
    "🔐 Utilisez un gestionnaire de mots de passe.",
    "🔎 Revoyez régulièrement les autorisations.",
    "💾 Stockez vos sauvegardes en lieu sûr.",
    "☁️ Activez les alertes de connexion suspecte sur votre plateforme cloud.",
    "🔐 Activez l’authentification multifacteur (MFA).",
    "🛡️ Mettez à jour vos conteneurs régulièrement.",
    "🚫 Ne jamais exposer les ports inutiles.",
    "🔒 Chiffrez les données en transit et au repos.",
    "📱 Sécurisez vos clés et tokens API."
  ];

  const handleRecToggle = (index) => {
    const updated = [...recommendations];
    updated[index].completed = !updated[index].completed;
    setRecommendations(updated);
    localStorage.setItem("recommendations", JSON.stringify(updated));
  };

  const handleNoteChange = (index, note) => {
    setRecNotes({ ...recNotes, [index]: note });
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      doc.setFont("Helvetica");
      let y = 20;
      doc.setFontSize(18);
      doc.text("Rapport de Sécurité", 20, y);
      y += 15;

      if (pieChartRef.current?.canvas) {
        const canvas = await html2canvas(pieChartRef.current.canvas, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 20, y, 80, 80);
        y += 90;
      }

      doc.setFontSize(14);
      doc.text("Recommandations", 20, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        body: recommendations.map((rec, index) => [
          rec.text,
          rec.completed ? "Terminé" : "En attente",
          recNotes[index] || "",
        ]),
        head: [["Recommandation", "Statut", "Note"]],
        styles: { fontSize: 10 },
        didDrawPage: (data) => { y = data.cursor.y + 10; },
      });

      doc.text("Conseils", 20, y);
      y += 10;
      autoTable(doc, {
        startY: y,
        body: tips.map(t => [t]),
        head: [["Conseil"]],
        styles: { fontSize: 10 },
        didDrawPage: (data) => { y = data.cursor.y + 10; },
      });

      doc.text("Failles OWASP", 20, y);
      y += 10;
      autoTable(doc, {
        startY: y,
        body: owaspDetected.map(item => {
          const faille = owaspMap[item] || { label: item, description: "", link: "" };
          return [faille.label, faille.description, faille.link];
        }),
        head: [["Faille", "Description", "Lien"]],
        styles: { fontSize: 10 },
      });

      const pdfBlob = doc.output('blob');
      const formData = new FormData();
      formData.append("pdf", pdfBlob, "rapport_securite_cloud.pdf");

      const response = await fetch("http://localhost:5000/api/report/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) toast.success("✅ PDF généré et sauvegardé !");
      else throw new Error("Erreur lors de l’envoi");

    } catch (err) {
      setError("Erreur export : " + err.message);
      toast.error("❌ Erreur lors de l’export !");
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Chargement des données...</p>
    </Container>
  );
  if (error) return <Container><h4 className="text-danger">{error}</h4></Container>;

  return (
    <ErrorBoundary>
      <style>{dashboardStyles}</style>
      <ToastContainer position="bottom-right" />
      <Container fluid className="py-4">

        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold text-center">📊 Tableau de bord de la Sécurité Cloud</h2>
            <p className="text-center text-muted">Analyse des risques, conseils et failles détectées</p>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Card className="dashboard-card p-3 text-center">
              <h5><FaShieldAlt className="me-2" />Score de Sécurité</h5>
              <Pie data={pieChartData} ref={pieChartRef} />
              <h6 className="mt-2 fw-bold">{riskScore}%</h6>
            </Card>
          </Col>
          <Col md={8}>
            <Card className="dashboard-card p-3">
              <Card.Header>
                <Card.Title><FaBug className="me-2 text-danger" />Failles OWASP détectées</Card.Title>
              </Card.Header>
              <Card.Body>
                <ul>
                  {owaspDetected.length ? owaspDetected.map((item, i) => {
                    const faille = owaspMap[item];
                    return (
                      <li key={i}>
                        <strong>{faille?.label || item}</strong><br />
                        <small>{faille?.description}</small><br />
                        <a href={faille?.link} target="_blank" rel="noreferrer">🔗 Détails</a>
                      </li>
                    );
                  }) : <li>✅ Aucune faille détectée</li>}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="dashboard-card p-3">
              <Card.Header><Card.Title>✅ Recommandations</Card.Title></Card.Header>
              <Card.Body>
                {recommendations.length ? (
                  <ul className="list-unstyled">
                    {recommendations.map((rec, i) => (
                      <li key={i}>
                        <div className="recommendation-item">
                          <input
                            type="checkbox"
                            checked={rec.completed}
                            onChange={() => handleRecToggle(i)}
                          />
                          <label>{rec.text}</label>
                          <span className={`badge ms-2 ${rec.completed ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {rec.completed ? "Terminé" : "À faire"}
                          </span>
                        </div>
                        <Form.Control
                          type="text"
                          className="recommendation-note"
                          placeholder="Ajouter une note..."
                          value={recNotes[i] || ""}
                          onChange={(e) => handleNoteChange(i, e.target.value)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : <p>Aucune recommandation disponible.</p>}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="dashboard-card p-3">
              <Card.Header><Card.Title><FaLightbulb className="me-2 text-warning" />Conseils Pratiques</Card.Title></Card.Header>
              <Card.Body>
                <ul className="mb-0">
                  {tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col className="text-center">
            <Button className="export-btn mt-3 me-2" onClick={exportToPDF}>
              <FaFilePdf className="me-1" />Exporter en PDF
            </Button>
            <Button className="export-btn mt-3" onClick={() => window.location.href = "http://localhost:5000/api/google/login"}>
              ☁️ Sauvegarder sur Google Drive
            </Button>
          </Col>
        </Row>

      </Container>
    </ErrorBoundary>
  );
}

export default Dashboard;
