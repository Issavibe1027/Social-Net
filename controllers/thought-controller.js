const { T, User } = require("../models");

const tC = {
  
  getAllT(req, res) {
    T.find({})
      .populate({
        path: "reactions",
        select: "-__v",
      })
      .select("-__v")
      .sort({ _id: -1 })
      .then((dbTData) => res.json(dbTData))
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  getTById({ params }, res) {
    T.findOne({ _id: params.id })
      .populate({
        path: "reactions",
        select: "-__v",
      })
      .select("-__v")
      .then((dbTData) => {
        if (!dbTData) {
          return res.status(404).json({ message: "No thought with this id!" });
        }
        res.json(dbTData);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  
  createThought({ params, body }, res) {
    T.create(body)
      .then(({ _id }) => {
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { t: _id } },
          { new: true }
        );
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          return res
            .status(404)
            .json({ message: "No user id for this thought!" });
        }

        res.json({ message: "Thought successfully created!" });
      })
      .catch((err) => res.json(err));
  },


  updateT({ params, body }, res) {
    T.findOneAndUpdate({ _id: params.id }, body, {
      new: true,
      runValidators: true,
    })
      .then((dbTData) => {
        if (!dbTData) {
          res.status(404).json({ message: "No thought found with this id!" });
          return;
        }
        res.json(dbTData);
      })
      .catch((err) => res.json(err));
  },

 
  deleteT({ params }, res) {
    T.findOneAndDelete({ _id: params.id })
      .then((dbTData) => {
        if (!dbTData) {
          return res.status(404).json({ message: "No thought with this id!" });
        }

        
        return User.findOneAndUpdate(
          { thoughts: params.id },
          { $pull: { thoughts: params.id } }, 
          { new: true }
        );
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          return res
            .status(404)
            .json({ message: "No id for this thought!" });
        }
        res.json({ message: "Thought successfully deleted!" });
      })
      .catch((err) => res.json(err));
  },


  addReaction({ params, body }, res) {
    T.findOneAndUpdate(
      { _id: params.thoughtId },
      { $addToSet: { reactions: body } },
      { new: true, runValidators: true }
    )
      .then((dbTData) => {
        if (!dbTData) {
          res.status(404).json({ message: "No thought with this id" });
          return;
        }
        res.json(dbTData);
      })
      .catch((err) => res.json(err));
  },

  
  removeReaction({ params }, res) {
    T.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: { reactionId: params.reactionId } } },
      { new: true }
    )
      .then((dbTData) => res.json(dbTData))
      .catch((err) => res.json(err));
  },
};

module.exports = tC;
