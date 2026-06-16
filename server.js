const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection failed:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

/* =========================
   STATIC ROUTES
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   MONGODB CONNECTION
========================= */
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/student_smart_board";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("📦 Database:", MONGODB_URI);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

/* =========================
   SCHEMAS
========================= */
const StudentSchema = new mongoose.Schema(
  {
    roll: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

const AttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
  },
  { timestamps: true }
);

/* =========================
   MODELS
========================= */
const Student = mongoose.model("Student", StudentSchema);
const Event = mongoose.model("Event", EventSchema);
const Attendance = mongoose.model("Attendance", AttendanceSchema);

/* =========================
   USERS (TEMP STORAGE)
========================= */
let users = [
  {
    username: "classteacher",
    password: "class123",
    role: "class",
    email: "class@example.com",
  },
  {
    username: "sci_teacher",
    password: "sci123",
    role: "subject",
    subjects: ["SC"],
    email: "science@example.com",
  },
  {
    username: "math_teacher",
    password: "math123",
    role: "subject",
    subjects: ["MA"],
    email: "maths@example.com",
  },
  {
    username: "ss_teacher",
    password: "ss123",
    role: "subject",
    subjects: ["SS"],
    email: "social@example.com",
  },
  {
    username: "en_teacher",
    password: "en123",
    role: "subject",
    subjects: ["EN"],
    email: "english@example.com",
  },
  {
    username: "tel_teacher",
    password: "tel123",
    role: "subject",
    subjects: ["TE"],
    email: "telugu@example.com",
  },
  {
    username: "hi_teacher",
    password: "hi123",
    role: "subject",
    subjects: ["HI"],
    email: "hindi@example.com",
  },
  {
    username: "dr_teacher",
    password: "dr123",
    role: "subject",
    subjects: ["DR"],
    email: "drawing@example.com",
  },
];

/* =========================
   SUBJECTS API
========================= */
app.get("/api/subjects", (req, res) => {
  res.json([
    { code: "SC", name: "Science" },
    { code: "MA", name: "Maths" },
    { code: "SS", name: "Social Studies" },
    { code: "EN", name: "English" },
    { code: "TE", name: "Telugu" },
    { code: "HI", name: "Hindi" },
    { code: "DR", name: "Drawing" },
  ]);
});

/* =========================
   LOGIN
========================= */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.json({
      success: true,
      message: "Login successful",
      user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

/* =========================
   SIGNUP
========================= */
app.post("/api/signup", (req, res) => {
  const { username, email, role, subject, password } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing",
    });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({
      success: false,
      message: "Username already exists",
    });
  }

  const newUser = {
    username,
    password,
    role,
    email,
    subjects: role === "subject" ? [subject] : [],
  };

  users.push(newUser);

  res.json({
    success: true,
    message: "Signup successful",
    user: newUser,
  });
});

app.post("/api/change-password", (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters",
    });
  }

  const user = users.find((u) => u.username === username);

  if (!user || user.password !== currentPassword) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = newPassword;

  res.json({
    success: true,
    message: "Password changed successfully",
    user,
  });
});

/* =========================
   STUDENT ROUTES
========================= */
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ roll: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    console.log("Student Data:", req.body);

    const { roll, name } = req.body;

    if (!roll || !name) {
      return res.status(400).json({
        success: false,
        message: "Roll and name required",
      });
    }

    const student = new Student({
      roll: Number(roll),
      name: name.trim(),
    });

    const savedStudent = await student.save();

    console.log("✅ Student saved");

    res.status(201).json(savedStudent);
  } catch (error) {
    console.error("❌ Student save error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    await Attendance.deleteMany({
      student: student._id,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   EVENT ROUTES
========================= */
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const { title, date, description } = req.body;

    const event = await Event.create({
      title,
      date,
      description,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   ATTENDANCE ROUTES
========================= */
app.get("/api/attendance", async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("student")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    console.log("Attendance Data:", req.body);

    const { studentId, subject, date, status } = req.body;

    const formattedDate = new Date(date);

    let record = await Attendance.findOne({
      student: studentId,
      subject,
      date: formattedDate,
    });

    if (record) {
      record.status = status;
      await record.save();

      return res.json({
        message: "Attendance updated",
        data: record,
      });
    }

    record = new Attendance({
      student: studentId,
      subject,
      date: formattedDate,
      status,
    });

    const savedRecord = await record.save();

    console.log("✅ Attendance saved");

    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("❌ Attendance error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   REPORT
========================= */
app.get("/api/report/:studentId", async (req, res) => {
  try {
    const records = await Attendance.find({
      student: req.params.studentId,
    }).sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

