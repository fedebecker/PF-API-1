var express = require('express');
var router = express.Router();
const data = require('../data/users');
const auth = require('../middleware/auth');
const joi = require('joi');

//PODRÍA MODIFICARSE PARA OBTENER TODOS LOS CONTACTOS DE UN USUARIO
/* GET users listing. */
// api/users/
// router.get('/', auth, async function(req, res, next) {
//   const users = await data.getAllUsers();
//   res.send(users);
// });

//AGREGAR USER
router.post('/', async (req, res) =>{
  // name: joi.string().alphanum().min(3).required(),
  // lastName: joi.string().alphanum().min(3).required(),
  // email: joi.string().alphanum().min(3).required(),
  // password: joi.string().alphanum().min(3).required(),
  // age: joi.string().alphanum().min(3).required(),
  // state: joi.string().alphanum().min(3).required()
  

  const result = await data.addUser(req.body);
  res.send(result);
});

//FIND
router.get('/:id', async (req,res)=>{
  const user = await data.getUser(req.params.id);
  if(user){
      res.json(user);
  } else {
      res.status(404).send('Usuario no encontrado');
  }
});

//LOGIN
router.post('/login', async (req, res)=>{
  try {
    const user = await data.login(req.body.email, req.body.password);
    const token = data.generateAuthToken(user);
    res.send({user, token});
  } catch (error) {
      res.status(401).send(error.message);
  }
});

//AGREGAR CONTACTO
router.post('/:id/addContact', auth, async (req, res) => {
 
  const result = await data.addContact(req.params.id, req.body.email);
  res.send(result);
});

//UPDATE
router.post('/:id', auth, async (req, res) => {
  //validaciones, a mejorar, agregar en addUser
  const schema = joi.object({
    email: joi.string().alphanum().min(3).required(),
    password: joi.string().alphanum().min(3).required(),
    //year: joi.number().min(1900).max(2020).required()
  });
  const result = schema.validate(req.body);
  
  if(result.error){
      res.status(400).send(result.error.details[0].message);
  } else{
      let user = req.body;
      user._id = req.params.id;      
      user = await data.updateUser(user);
      res.json(user);
  }   
});
//DELETE
router.delete('/:id', async (req, res)=>{
  const user = await data.getUser(req.params.id)
  if(!user){
      res.status(404).send('Usuario no encontrado');
  } else {
      data.deleteUser(req.params.id);
      res.status(200).send('Usuario eliminado');
  }
});



module.exports = router;