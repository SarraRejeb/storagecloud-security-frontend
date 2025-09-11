import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Result() {
  const [score, setScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [owaspIssues, setOwaspIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/data', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur de chargement');
        setScore(data.riskScore);
        setRecommendations(data.recommendations || []);
        setOwaspIssues(data.owaspIssues || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  const getRiskLevel = () => {
    if (score >= 85) return ['Excellent 🔒', 'text-green-600'];
    if (score >= 60) return ['Moyen ⚠️', 'text-yellow-500'];
    return ['Risque Élevé 🔓', 'text-red-600'];
  };

  const [label, color] = getRiskLevel();

  if (loading) return <div className="content text-center p-10">Chargement...</div>;
  if (error) return <div className="content text-red-500 text-center p-10">{error}</div>;

  return (
    <div className="content">
      <div className="max-w-3xl mx-auto p-8 bg-white shadow rounded text-center">
        <h2 className="text-3xl font-bold mb-4">🛡️ Résultat de l’évaluation</h2>
        <div className="text-6xl text-blue-600 font-extrabold">{score} / 100</div>
        <div className={`text-xl mt-2 font-semibold ${color}`}>{label}</div>

        {recommendations.length > 0 && (
          <div className="mt-8 bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">🔍 Recommandations :</h3>
        
              {recommendations.map((rec, i) => (
                <li key={i}>{typeof rec === 'object' ? rec.text : rec}</li>
              ))}
            
          </div>
        )}

        {owaspIssues.length > 0 && (
          <div className="mt-6 bg-red-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-red-600">⚠️ Problèmes OWASP :</h3>
            
              {owaspIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            
          </div>
        )}

        <div className="mt-8 space-x-4">
          <Link to="/admin/quiz">
            <button className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">
              🔁 Refaire le quiz
            </button>
          </Link>
          <Link to="/admin/dashboard">
            <button className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">
              📊 Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
