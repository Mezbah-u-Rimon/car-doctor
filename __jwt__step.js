/***
 * 1. install jsonwebtoken
 * 2. jwt.sign (payload, secret, {expiresIn: })
 * 3. token client
 *
*/

/**
 * how to store token in the client side
 * 1. memory --> ok type
 * 2. local storage --> ok type
 * 3. cookies --> http only
 * **/


/**
 * 1. set cookies with http only . development secure:false,
 * 2. cors
 * app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));

 * 3. client side axios setting
* 4. in axios set withCredentials : true
 * **/

/**
 * 1. to send cookies from the client make sure you added withCredentials :true for the api call using axios ..
*/