import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/quiz/questions');
        const data = await response.json();
        if (response.ok) {
          setQuestions(data);
        } else {
          setError(data.error || 'Erreur lors du chargement des questions');
        }
      } catch (error) {
        setError('Erreur réseau: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      setError('Veuillez répondre à toutes les questions avant de continuer.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter pour soumettre le quiz.');
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      console.log('Backend response:', data); // Debug log
      if (response.ok) {
        // Clear previous localStorage entries
        localStorage.removeItem('riskScore');
        localStorage.removeItem('recommendations');
        localStorage.removeItem('owaspIssues');
        
        // Save results
        localStorage.setItem('riskScore', data.riskScore || 0);
        
        // Handle recommendations safely
        const recommendations = Array.isArray(data.recommendations)
          ? data.recommendations.map(item => 
              typeof item === 'object' && item.text ? item.text : item
            )
          : [];
        localStorage.setItem('recommendations', JSON.stringify(recommendations));
        
        // Save owaspIssues
        localStorage.setItem('owaspIssues', JSON.stringify(data.owaspIssues || []));
        
        navigate('/admin/result', {
  state: {
    riskScore: data.riskScore,
    recommendations: Array.isArray(data.recommendations)
      ? data.recommendations.map((r) =>
          typeof r === 'object' && r.text ? r.text : r
        )
      : [],
    owaspIssues: data.owaspIssues || [],
  },
});

      } else {
        setError(data.error || 'Erreur lors de la soumission du quiz');
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    } catch (error) {
      setError('Erreur réseau: ' + error.message);
      console.error('Submission error:', error);
    }
  };

  if (loading) {
    return <div className="content"><div className="text-center p-10">Chargement...</div></div>;
  }

  return (
    <div className="content">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-10 bg-white shadow-lg rounded-lg space-y-8">
        <h2 className="text-4xl font-bold text-center text-blue-700 mb-4">🔒 Évaluation de la Sécurité Cloud</h2>
        <p className="text-center text-gray-600 mb-6">
          Répondez à chaque question par <strong>Vrai</strong> ou <strong>Faux</strong> selon vos pratiques actuelles.
        </p>

        {questions.map((q) => (
          <div key={q.id} className="bg-gray-50 p-4 rounded shadow flex flex-col gap-3">
            <label htmlFor={q.id} className="text-gray-800 font-medium text-lg">{q.text}</label>
            <div className="flex gap-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value="true"
                  checked={answers[q.id] === true}
                  onChange={() => handleChange(q.id, true)}
                  className="text-blue-600"
                />
                <span className="ml-2">Vrai</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value="false"
                  checked={answers[q.id] === false}
                  onChange={() => handleChange(q.id, false)}
                  className="text-red-600"
                />
                <span className="ml-2">Faux</span>
              </label>
            </div>
          </div>
        ))}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-700 text-black px-8 py-3 rounded hover:bg-blue-800 font-semibold transition duration-200"
          >
            ✅ Évaluer mes pratiques
          </button>
        </div>
      </form>
    </div>
  );
}