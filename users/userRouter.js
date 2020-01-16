const express = require("express");

const Users = require("./userDb.js");
const Posts = require("../posts/postDb.js");

const router = express.Router();
// GET test
router.get("/test", (req, res) => {
  res.send(`
    
      <p>Welcome to the UserRouter API</p>
    `);
});

//POST new user
router.post("/", validateUser, (req, res) => {
  Users.insert(req.body).then(user => {
    res.status(201).json(user);
  });
});

// POST new post with id
router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
  const comment = req.body;
  const { user_id } = comment;
  if (!user_id) {
    res.status(400).json({
      errorMessage: "Please provide user_id for the comment."
    });
  }
  Posts.insert(req.body)
    .then(comment => {
      if (!comment) {
        res.status(404).json({
          message: "The post with the specified ID does not exist." //make sure 404 is working
        });
      } else {
        res.status(201).json(comment);
      }
    })
    .catch(error => {
      // log error to database
      console.log(error);
      res.status(500).json({
        error: "There was an error while saving the comment to the database"
      });
    });
});
//Get User
router.get("/", (req, res) => {
  Users.get(req.query)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        error: "the user info could not be retrieved"
      });
    });
});

router.get("/:id", validateUserId, (req, res) => {
  console.log(req.user);

  res.status(200).json(req.user);

  // console.log(req.params.id);
  // Users.getById(req.user)
  //   .then(user => {
  //     if (!user) {
  //       res.status(404).json({
  //         message: "The User with the specified ID does not exist."
  //       });
  //     } else {
  //       console.log(user);
  //       res.status(200).json(user);
  //     }
  //   })

  //   .catch(error => {
  //     // log error to database
  //     console.log(error);
  //     res.status(500).json({
  //       error: "The user information could not be retrieved."
  //     });
  //   });
});

router.get("/:id/posts", validateUserId, (req, res) => {
  Posts.getById(req.user.id)
    .then(post => {
      res.status(200).json(post);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: "Error getting the post "
      });
    });
});

router.delete("/:id", validateUserId, (req, res) => {
  Users.remove(req.user.id)
    .then(() => {
      res
        .status(200)
        .json({ message: `user with id ${req.user.id} was removed` });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        errorMessage: "the user could not be removed"
      });
    });
});
//PUT update user
router.put("/:id", validateUserId, validateUser, (req, res) => {
  const id = req.user.id;
  const users = req.body;

  Users.update(id, users)
    .then(user => {
      if (!user) {
        res.status(404).json({
          message: "The user with the specified ID does not exist."
        });
      } else {
        res.status(200).json({
          message: "The user information was updated successfully"
        });
      }
    })
    .catch(error => {
      console.log(error);
      //handle the error
      res.status(500).json({
        errorMessage: "The user information could not be modified."
      });
    });
});

// custom middleware

function validateUserId(req, res, next) {
  Users.getById(req.params.id)
    .then(users => {
      if (users) {
        req.user = users;
        next();
      } else {
        res.status(500).json({ message: "No user with this ID exists" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "need to give an ID" });
    });
}

function validateUser(req, res, next) {
  if (req.body.name) {
    next();
  } else if (!req.body.name) {
    res.status(400).json({ message: "missing name" });
  } else {
    res.status(400).json({ message: "Missing user data" });
  }
}

function validatePost(req, res, next) {
  if (!req.body.text && !req.body.user_id) {
    res.status(400).json({ message: "Missing post data" });
  } else if (!req.body.text) {
    res.status(400).json({ message: "missing text" });
  } else {
    next();
  }
}

module.exports = router;
