module.exports.logout = async (req, res) => 
    req.session.destroy(() => res.redirect("/"));