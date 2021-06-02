var express = require("express");
var router = express.Router();
const data = require("../data/users");
const auth = require("../middleware/auth");
const joi = require("joi");

//PODRÍA MODIFICARSE PARA OBTENER TODOS LOS CONTACTOS DE UN USUARIO
/* GET users listing. */
// api/users/
// investigar como recibir el token desde el front, y luego volver a colocar "auth"
router.get('/', async function(req, res, next) {
  const users = await data.getAllUsers();
  res.send(users);
});


//AGREGAR USER
router.post("/", async (req, res) => {
  const schemaPost = joi.object({
    name: joi.string().pattern(new RegExp("^[a-zA-Z]{3,30}$")).required,
    lastName: joi.string().pattern(new RegExp("^[a-zA-Z]{3,30}$")).required,
    email: joi.string().email({ minDomainSegments: 2, tlds: true }).required(),
    password: joi.string().alphanum().min(6).required(),
    age: joi.number().integer().min(18).max(120).required(),
    state:joi.required(),
  });
  const result = schemaPost.validate(req.body);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
  } else {
    let user = req.body;
    await data.addUser(user);
    res.send(result);
  }
});

//FIND
router.get("/:id", async (req, res) => {
  try {
    const user = await data.getUser(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.log(error);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await data.login(req.body.email, req.body.password);
    const token = data.generateAuthToken(user);
    console.log(token);
    res.send({ user, token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//AGREGAR CONTACTO
router.post("/:id/addContact", auth, async (req, res) => {
  const result = await data.addContact(req.params.id, req.body.email);
  res.send(result);
});

//UPDATE
router.post("/:id", auth, async (req, res) => {
  const schemaUpdate = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: true }),
    password: joi.string().alphanum().min(6),
    repeat_password: Joi.ref("password"),
    state: joi.required(),
  });
  const result = schemaUpdate.validate(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
  } else {
    let user = req.body;
    user._id = req.params.id;
    user = await data.updateUser(user);
    res.json(user);
  }
});
//DELETE
router.delete("/:id", async (req, res) => {
  const user = await data.getUser(req.params.id);
  if (!user) {
    res.status(404).send("Usuario no encontrado");
  } else {
    data.deleteUser(req.params.id);
    res.status(200).send("Usuario eliminado");
  }
});

module.exports = router;
