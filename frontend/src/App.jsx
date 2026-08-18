import {
  Routes,
  Route,
  Link,
  useNavigate,
  useSearchParams,
  useParams
} from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import "./App.css"
import certifyLogo from "./assets/certify-logo.png"

function VerificationPage() {
  const [searchParams] = useSearchParams()
  const [certificateId, setCertificateId] = useState(
    searchParams.get("certificateId") || ""
  )
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const verifyCertificate = async () => {
    if (!certificateId.trim()) {
      setResult({
        status: "Error",
        message: "Please enter a certificate ID"
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(
        `https://certiverify-backend-dpaz.onrender.com/api/verify/${certificateId.trim()}`
      )

      const data = await response.json()
      setResult(data)
    } catch {
      setResult({
        status: "Error",
        message: "Unable to connect to the backend server"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = searchParams.get("certificateId")

    if (id) {
      setCertificateId(id)
    }
  }, [searchParams])

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
  <img src={certifyLogo} alt="CertiFy logo" />
</div>

          <div>
            <h1>CertiFy</h1>
            <span>Tamper-Proof Verification</span>
          </div>
        </div>

        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-badge">
            SECURE CERTIFICATE VERIFICATION
          </div>

          <h2>Verify Your Certificate</h2>

          <p>
            Instantly verify the authenticity and integrity of an
            academic certificate using its unique certificate ID.
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Enter certificate ID"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  verifyCertificate()
                }
              }}
            />

            <button
              onClick={verifyCertificate}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Certificate"}
            </button>
          </div>
        </section>

        {result && (
          <section className="result-card">
            <span className="status-label">
              VERIFICATION STATUS
            </span>

            <h3>{result.status}</h3>

            <p>{result.message}</p>

            {result.certificate && (
              <div className="certificate-details">
                <div className="detail">
                  <span>Certificate ID</span>
                  <strong>
                    {result.certificate.certificateId}
                  </strong>
                </div>

                <div className="detail">
                  <span>Student Name</span>
                  <strong>
                    {result.certificate.studentName}
                  </strong>
                </div>

                <div className="detail">
                  <span>Course</span>
                  <strong>
                    {result.certificate.course}
                  </strong>
                </div>

                <div className="detail">
                  <span>Grade</span>
                  <strong>
                    {result.certificate.grade}
                  </strong>
                </div>

                <div className="detail">
                  <span>Issue Date</span>
                  <strong>
                    {new Date(
                      result.certificate.issueDate
                    ).toLocaleDateString()}
                  </strong>
                </div>

                {result.revokedAt && (
                  <div className="detail">
                    <span>Revoked At</span>
                    <strong>
                      {new Date(
                        result.revokedAt
                      ).toLocaleString()}
                    </strong>
                  </div>
                )}

                {result.reason && (
                  <div className="detail">
                    <span>Reason</span>
                    <strong>{result.reason}</strong>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setMessage("Email and password are required")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(
        "https://certiverify-backend-dpaz.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Login failed")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      if (data.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } catch {
      setMessage(
        "Unable to connect to the backend server"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Institution Login</h1>

        <p>Sign in to manage certificates</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {message && <p>{message}</p>}

        <Link to="/">Back to Verification</Link>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!name || !email || !password) {
      setMessage(
        "Name, email and password are required"
      )
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(
        "https://certiverify-backend-dpaz.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed"
        )
        return
      }

      setMessage("Registration successful")

      setTimeout(() => {
        navigate("/login")
      }, 1000)
    } catch {
      setMessage(
        "Unable to connect to the backend server"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Institution Account</h1>

        <p>
          Register to issue and manage certificates
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Institution name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {message && <p>{message}</p>}

        <Link to="/">Back to Verification</Link>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [certificates, setCertificates] = useState([])
  const [totalCertificates, setTotalCertificates] =
    useState(0)
  const [activeCertificates, setActiveCertificates] =
    useState(0)
  const [revokedCertificates, setRevokedCertificates] =
    useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [revokingId, setRevokingId] = useState(null)
  const [reason, setReason] = useState("")
  const [selectedCertificate, setSelectedCertificate] =
    useState(null)

  const navigate = useNavigate()

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  )

  const token = localStorage.getItem("token")

  const fetchCertificates = async () => {
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const response = await fetch(
        "https://certiverify-backend-dpaz.onrender.com/api/certificates",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          navigate("/login")
          return
        }

        setMessage(
          data.message ||
            "Unable to load certificates"
        )

        return
      }

      setCertificates(data.certificates || [])

      setTotalCertificates(
        data.totalCertificates || 0
      )

      setActiveCertificates(
        data.activeCertificates || 0
      )

      setRevokedCertificates(
        data.revokedCertificates || 0
      )
    } catch {
      setMessage(
        "Unable to connect to the backend server"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const openRevoke = (certificate) => {
    setSelectedCertificate(certificate)
    setReason("")
  }

  const closeRevoke = () => {
    setSelectedCertificate(null)
    setReason("")
  }

  const revokeCertificate = async () => {
    if (!selectedCertificate) {
      return
    }

    if (!reason.trim()) {
      setMessage("Please enter a revocation reason")
      return
    }

    setRevokingId(
      selectedCertificate.certificateId
    )

    setMessage("")

    try {
      const response = await fetch(
        `https://certiverify-backend-dpaz.onrender.com/api/revoke/${selectedCertificate.certificateId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            reason: reason.trim()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.message ||
            "Certificate revocation failed"
        )
        return
      }

      closeRevoke()

      setMessage(
        "Certificate revoked successfully"
      )

      await fetchCertificates()
    } catch {
      setMessage(
        "Unable to connect to the backend server"
      )
    } finally {
      setRevokingId(null)
    }
  }

  return (
   <div className="dashboard-page">
  <header className="dashboard-navbar">
    <div className="dashboard-brand">
      <img src={certifyLogo} alt="CertiFy logo" />

      <div>
        <h1>CertiFy</h1>
        <span>Institution Dashboard</span>
      </div>
    </div>

    <div className="dashboard-user">
      <span>
        {user?.name || "Institution"}
      </span>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  </header>

      <main className="dashboard-content">
        <section className="dashboard-heading">
          <div>
            <p>Welcome back</p>

            <h2>
              {user?.name || "Institution"}
            </h2>
          </div>

          <Link
            to="/issue-certificate"
            className="primary-action"
          >
            Issue Certificate
          </Link>
        </section>

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Certificates</span>

            <strong>
              {totalCertificates}
            </strong>
          </div>

          <div className="stat-card">
            <span>Active Certificates</span>

            <strong>
              {activeCertificates}
            </strong>
          </div>

          <div className="stat-card">
            <span>Revoked Certificates</span>

            <strong>
              {revokedCertificates}
            </strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h3>Certificate Records</h3>

              <p>
                Certificates issued by your institution
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading certificates...
            </div>
          ) : certificates.length === 0 ? (
            <div className="empty-state">
              <h3>No certificates yet</h3>

              <p>
                Issue your first certificate to see
                it listed here.
              </p>

              <Link
                to="/issue-certificate"
                className="primary-action"
              >
                Issue Certificate
              </Link>
            </div>
          ) : (
            <div className="certificate-table">
              <div className="table-header">
                <span>Certificate ID</span>
                <span>Student</span>
                <span>Course</span>
                <span>Grade</span>
                <span>Issue Date</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {certificates.map(
                (certificate) => (
                  <div
                    className="table-row"
                    key={certificate._id}
                  >
                    <span>
                      {certificate.certificateId}
                    </span>

                    <span>
                      {certificate.studentName}
                    </span>

                    <span>
                      {certificate.course}
                    </span>

                    <span>
                      {certificate.grade}
                    </span>

                    <span>
                      {new Date(
                        certificate.issueDate
                      ).toLocaleDateString()}
                    </span>

                    <span>
                      {certificate.status}
                    </span>

                    <span className="certificate-actions">
                      <Link
                        to={`/certificate/${certificate.certificateId}`}
                      >
                        View
                      </Link>

                      <Link
                        to={`/?certificateId=${certificate.certificateId}`}
                      >
                        Verify
                      </Link>

                      {certificate.status ===
                        "Active" && (
                        <button
                          onClick={() =>
                            openRevoke(
                              certificate
                            )
                          }
                          disabled={
                            revokingId ===
                            certificate.certificateId
                          }
                        >
                          Revoke
                        </button>
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="dashboard-actions">
          <Link
            to="/"
            className="action-card"
          >
            <h3>Verify Certificate</h3>

            <p>
              Check certificate authenticity and
              integrity.
            </p>
          </Link>

          <Link
            to="/issue-certificate"
            className="action-card"
          >
            <h3>Issue Certificate</h3>

            <p>
              Create a new tamper-proof certificate.
            </p>
          </Link>
        </section>
      </main>

      {selectedCertificate && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Revoke Certificate</h2>

            <p>
              You are about to revoke:
            </p>

            <strong>
              {selectedCertificate.certificateId}
            </strong>

            <p>
              Student:{" "}
              {selectedCertificate.studentName}
            </p>

            <textarea
              placeholder="Enter revocation reason"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              rows="4"
            />

            <div className="modal-actions">
              <button
                onClick={closeRevoke}
                disabled={revokingId !== null}
              >
                Cancel
              </button>

              <button
                onClick={revokeCertificate}
                disabled={revokingId !== null}
              >
                {revokingId
                  ? "Revoking..."
                  : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminDashboardPage() {
  const [certificates, setCertificates] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [totalCertificates, setTotalCertificates] =
    useState(0)
  const [activeCertificates, setActiveCertificates] =
    useState(0)
  const [revokedCertificates, setRevokedCertificates] =
    useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [institutionFilter, setInstitutionFilter] =
    useState("All")

  const navigate = useNavigate()

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  )

  const token = localStorage.getItem("token")

  const fetchAdminData = async () => {
    if (!token || user?.role !== "admin") {
      navigate("/login")
      return
    }

    try {
      const [
        certificateResponse,
        institutionResponse
      ] = await Promise.all([
        fetch(
          "https://certiverify-backend-dpaz.onrender.com/api/certificates",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ),
        fetch(
          "https://certiverify-backend-dpaz.onrender.com/api/certificates/institutions",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      ])

      const certificateData =
        await certificateResponse.json()

      const institutionData =
        await institutionResponse.json()

      if (!certificateResponse.ok) {
        setMessage(
          certificateData.message ||
            "Unable to load certificates"
        )
        return
      }

      if (!institutionResponse.ok) {
        setMessage(
          institutionData.message ||
            "Unable to load institutions"
        )
        return
      }

      setCertificates(
        certificateData.certificates || []
      )

      setInstitutions(
        institutionData.institutions || []
      )

      setTotalCertificates(
        certificateData.totalCertificates || 0
      )

      setActiveCertificates(
        certificateData.activeCertificates || 0
      )

      setRevokedCertificates(
        certificateData.revokedCertificates || 0
      )
    } catch {
      setMessage(
        "Unable to connect to the backend server"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const filteredCertificates = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return certificates.filter((certificate) => {
      const matchesSearch =
        !search ||
        certificate.certificateId
          ?.toLowerCase()
          .includes(search) ||
        certificate.studentName
          ?.toLowerCase()
          .includes(search) ||
        certificate.course
          ?.toLowerCase()
          .includes(search) ||
        certificate.grade
          ?.toLowerCase()
          .includes(search)

      const matchesStatus =
        statusFilter === "All" ||
        certificate.status === statusFilter

      const matchesInstitution =
        institutionFilter === "All" ||
        certificate.institution?._id ===
          institutionFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesInstitution
      )
    })
  }, [
    certificates,
    searchTerm,
    statusFilter,
    institutionFilter
  ])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("All")
    setInstitutionFilter("All")
  }

  return (
    <div className="dashboard-page">
  <header className="dashboard-navbar">
    <div className="dashboard-brand">
      <img src={certifyLogo} alt="CertiFy logo" />

      <div>
        <h1>CertiFy</h1>
        <span>Admin Dashboard</span>
      </div>
    </div>

    <div className="dashboard-user">
      <span>
        {user?.name || "Admin"}
      </span>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  </header>

      <main className="dashboard-content">
        <section className="dashboard-heading">
          <div>
            <p>Welcome back</p>

            <h2>
              {user?.name || "Admin"}
            </h2>
          </div>
        </section>

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Institutions</span>

            <strong>
              {institutions.length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Total Certificates</span>

            <strong>
              {totalCertificates}
            </strong>
          </div>

          <div className="stat-card">
            <span>Active Certificates</span>

            <strong>
              {activeCertificates}
            </strong>
          </div>

          <div className="stat-card">
            <span>Revoked Certificates</span>

            <strong>
              {revokedCertificates}
            </strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h3>Registered Institutions</h3>

              <p>
                Institutions using CertiFy
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading institutions...
            </div>
          ) : institutions.length === 0 ? (
            <div className="empty-state">
              No institutions registered.
            </div>
          ) : (
            <div className="certificate-table">
              <div className="table-header">
                <span>Institution</span>
                <span>Email</span>
                <span>Registered</span>
              </div>

              {institutions.map(
                (institution) => (
                  <div
                    className="table-row"
                    key={institution._id}
                  >
                    <span>
                      {institution.name}
                    </span>

                    <span>
                      {institution.email}
                    </span>

                    <span>
                      {new Date(
                        institution.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h3>All Certificate Records</h3>

              <p>
                Certificates issued by all institutions
              </p>
            </div>
          </div>

          <div className="admin-filters">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search certificate ID, student, course or grade"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <div className="admin-filter">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="All">
                  All Statuses
                </option>
                <option value="Active">
                  Active
                </option>
                <option value="Revoked">
                  Revoked
                </option>
              </select>
            </div>

            <div className="admin-filter">
              <select
                value={institutionFilter}
                onChange={(e) =>
                  setInstitutionFilter(
                    e.target.value
                  )
                }
              >
                <option value="All">
                  All Institutions
                </option>

                {institutions.map(
                  (institution) => (
                    <option
                      key={institution._id}
                      value={institution._id}
                    >
                      {institution.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              className="clear-filter-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <div className="filter-summary">
            <span>
              Showing{" "}
              <strong>
                {filteredCertificates.length}
              </strong>{" "}
              of{" "}
              <strong>
                {certificates.length}
              </strong>{" "}
              certificates
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading certificates...
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="empty-state">
              <h3>No certificates found</h3>

              <p>
                Try changing your search or filters.
              </p>

              <button
                className="primary-action"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="certificate-table">
              <div className="table-header">
                <span>Certificate ID</span>
                <span>Institution</span>
                <span>Student</span>
                <span>Course</span>
                <span>Grade</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filteredCertificates.map(
                (certificate) => (
                  <div
                    className="table-row"
                    key={certificate._id}
                  >
                    <span>
                      {certificate.certificateId}
                    </span>

                    <span>
                      {certificate.institution?.name ||
                        "Unknown"}
                    </span>

                    <span>
                      {certificate.studentName}
                    </span>

                    <span>
                      {certificate.course}
                    </span>

                    <span>
                      {certificate.grade}
                    </span>

                    <span>
                      {certificate.status}
                    </span>

                    <span className="certificate-actions">
                      <Link
                        to={`/certificate/${certificate.certificateId}`}
                      >
                        View
                      </Link>

                      <Link
                        to={`/?certificateId=${certificate.certificateId}`}
                      >
                        Verify
                      </Link>
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
function CertificateDetailsPage() {
  const { certificateId } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [downloading, setDownloading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchCertificate = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(
          `https://certiverify-backend-dpaz.onrender.com/api/certificates/${certificateId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setMessage(
            data.message ||
              "Certificate not found"
          )
          return
        }

        setCertificate(data)
      } catch {
        setMessage(
          "Unable to connect to the backend server"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCertificate()
  }, [certificateId, navigate])

  const downloadCertificate = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/login")
      return
    }

    setDownloading(true)
    setMessage("")

    try {
      const response = await fetch(
        `https://certiverify-backend-dpaz.onrender.com/api/certificates/download/${certificateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const data = await response.json()
        setMessage(
          data.message ||
            "Unable to download certificate"
        )
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")

      link.href = url
      link.download = `${certificateId}.pdf`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch {
      setMessage(
        "Unable to connect to the backend server"
      )
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="details-page">
        <div className="details-card">
          <h2>Loading certificate...</h2>
        </div>
      </div>
    )
  }

  if (message && !certificate) {
    return (
      <div className="details-page">
        <div className="details-card">
          <h2>{message}</h2>

          <Link to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="details-page">
      <div className="details-card">
        <div className="details-header">
          <div>
            <span>Certificate Details</span>

            <h1>
              {certificate.certificate.certificateId}
            </h1>
          </div>

          <div className="details-status">
            {certificate.status}
          </div>
        </div>

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        <div className="details-grid">
          <div className="details-item">
            <span>Student Name</span>

            <strong>
              {certificate.certificate.studentName}
            </strong>
          </div>

          <div className="details-item">
            <span>Course</span>

            <strong>
              {certificate.certificate.course}
            </strong>
          </div>

          <div className="details-item">
            <span>Grade</span>

            <strong>
              {certificate.certificate.grade}
            </strong>
          </div>

          <div className="details-item">
            <span>Issue Date</span>

            <strong>
              {new Date(
                certificate.certificate.issueDate
              ).toLocaleDateString()}
            </strong>
          </div>

          <div className="details-item">
            <span>Institution</span>

            <strong>
              {certificate.certificate.institution?.name}
            </strong>
          </div>

          <div className="details-item">
            <span>Institution Email</span>

            <strong>
              {certificate.certificate.institution?.email}
            </strong>
          </div>
        </div>

        <div className="hash-section">
          <h2>Cryptographic Information</h2>

          <div className="hash-box">
            <span>SHA-256 Certificate Hash</span>

            <p>
              {certificate.certificate.hash}
            </p>
          </div>

          <div className="hash-box">
            <span>Previous Hash</span>

            <p>
              {certificate.certificate.previousHash}
            </p>
          </div>
        </div>

        {certificate.revocation && (
          <div className="revocation-section">
            <h2>Revocation Information</h2>

            <div className="details-grid">
              <div className="details-item">
                <span>Revoked At</span>

                <strong>
                  {new Date(
                    certificate.revocation.revokedAt
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="details-item">
                <span>Reason</span>

                <strong>
                  {certificate.revocation.reason}
                </strong>
              </div>
            </div>
          </div>
        )}

        <div className="details-actions">
          <Link to="/dashboard">
            Back to Dashboard
          </Link>

          <Link
            to={`/?certificateId=${certificateId}`}
          >
            Verify Certificate
          </Link>

          <button
            type="button"
            onClick={downloadCertificate}
            disabled={downloading}
          >
            {downloading
              ? "Preparing PDF..."
              : "Download Certificate PDF"}
          </button>
        </div>
      </div>
    </div>
  )
}
function IssueCertificatePage() {
  const [studentName, setStudentName] = useState("")
  const [course, setCourse] = useState("")
  const [grade, setGrade] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [message, setMessage] = useState("")
  const [certificate, setCertificate] =
    useState(null)
  const [pdf, setPdf] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleIssue = async (e) => {
    e.preventDefault()

    if (
      !studentName ||
      !course ||
      !grade ||
      !issueDate
    ) {
      setMessage("All fields are required")
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/login")
      return
    }

    setLoading(true)
    setMessage("")
    setCertificate(null)
    setPdf(null)

    try {
      const response = await fetch(
        "https://certiverify-backend-dpaz.onrender.com/api/certificates/issue",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            studentName,
            course,
            grade,
            issueDate
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.message ||
            "Certificate issuance failed"
        )
        return
      }

      setCertificate(data.certificate)
      setPdf(data.pdf)

      setMessage(
        "Certificate issued successfully"
      )

      setStudentName("")
      setCourse("")
      setGrade("")
      setIssueDate("")
    } catch {
      setMessage(
        "Unable to connect to the backend server"
      )
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = () => {
    if (!pdf || !certificate) {
      return
    }

    const byteCharacters = atob(pdf)

    const byteNumbers = new Array(
      byteCharacters.length
    )

    for (
      let i = 0;
      i < byteCharacters.length;
      i++
    ) {
      byteNumbers[i] =
        byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(
      byteNumbers
    )

    const blob = new Blob(
      [byteArray],
      {
        type: "application/pdf"
      }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")

    link.href = url

    link.download =
      `${certificate.certificateId}.pdf`

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Issue Certificate</h1>

        <p>
          Create a tamper-proof certificate
        </p>

        <form onSubmit={handleIssue}>
          <input
            type="text"
            placeholder="Student name"
            value={studentName}
            onChange={(e) =>
              setStudentName(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Course"
            value={course}
            onChange={(e) =>
              setCourse(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Grade"
            value={grade}
            onChange={(e) =>
              setGrade(e.target.value)
            }
          />

          <input
            type="date"
            value={issueDate}
            onChange={(e) =>
              setIssueDate(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Issuing..."
              : "Issue Certificate"}
          </button>
        </form>

        {message && <p>{message}</p>}

        {certificate && (
          <div className="certificate-created">
            <h3>Certificate Created</h3>

            <p>
              Certificate ID:{" "}
              <strong>
                {certificate.certificateId}
              </strong>
            </p>

            <p>
              Student:{" "}
              <strong>
                {certificate.studentName}
              </strong>
            </p>

            <p>
              Course:{" "}
              <strong>
                {certificate.course}
              </strong>
            </p>

            <p>
              Grade:{" "}
              <strong>
                {certificate.grade}
              </strong>
            </p>

            <p>
              Verification URL:{" "}
              <strong>
                {certificate.verificationUrl}
              </strong>
            </p>

            {pdf && (
              <button
                type="button"
                onClick={downloadPdf}
              >
                Download Certificate PDF
              </button>
            )}
          </div>
        )}

        <Link to="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<VerificationPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />

      <Route
        path="/admin"
        element={<AdminDashboardPage />}
      />

      <Route
        path="/certificate/:certificateId"
        element={<CertificateDetailsPage />}
      />

      <Route
        path="/issue-certificate"
        element={<IssueCertificatePage />}
      />
    </Routes>
  )
}

export default App