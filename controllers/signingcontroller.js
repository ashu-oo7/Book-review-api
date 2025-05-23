
const client = require('../db');
const {createToken} = require('../middleware/tokenHandler');
const bcrypt = require('bcrypt');

const saltRounds = 10;




async function signUpControllerasync(req,res){
    let email = req?.body?.email;
    let password = req?.body?.password;

    if( !email || !password)
         return res.status(400).send("Email and password are required.");
     try {
        
        //checking if email is present in database

        const checkUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkUser.rows.length > 0) {
            return res.status(409).send("User already exists.");
        }

        // Step 3: Insert user into the DB
        // Hash the password before storing it
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            // Store hash in your password DB.
            await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).send("Internal server error.");
                }
            });
        
        });


        return res.status(201).send("User registered successfully.");
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).send("Internal server error.");
    }
}


async function signInControllerasync(req,res){

    let email = req?.body?.email;
    let password = req?.body?.password;

    if( !email || !password)
         return res.status(400).send("Email and password are required.");
     try {

        const checkUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkUser.rows.length === 0) {
            return res.status(401).send("Invalid credentials.");
        }

         const user = checkUser.rows[0];
        
        //checking if email is present in database
        bcrypt.compare(password, user.password, async function(err, result) {
       
       
        if (result == false) {
            return res.status(401).send("Invalid credentials.");
        }

        token = await createToken(email);

        return res.status(200).send(token);
            
        });

        
    } catch (err) {
        console.error('Signin error:', err);
        return res.status(500).send("Internal server error.");
    }

}

module.exports = {
    signUpControllerasync,signInControllerasync
}