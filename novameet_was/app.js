import express from "express";
import router from "./router.js";
import cors from "cors";
import session from "express-session"
import sessionFileStore from "session-file-store";

const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: "false"}))

const FileStore = sessionFileStore(session);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

app.use('/api', router);

export default app;