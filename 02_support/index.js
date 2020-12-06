let express = require('express');
let e = express();

const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: false});

let app = require('./modules/app.js');
app.init();
/*app.setDemo([
    { login: 'customer', password: '123', fio: 'customer', phone: '123', role: 0 },
    { login: 'manager', password: '123', fio: 'manager', phone: '', role: 1 },
    { login: 'admin', password: '123', fio: 'admin', phone: '', role: 2 },
]);*/

e.set('view engine', 'ejs');
e.use(express.static('public'));
e.use(cookieParser());

let authUserWithSession = (request, result) => {
    let session = request.cookies.session;
    if (session)
        return app.authUserWithSession(session);
    return { ok: false };
};

e.get('/', function (request, result) {
    let user = authUserWithSession(request, result);
    if (user.ok) {
        if (user.role == 1)
            result.redirect('/manage');
        else if (user.role == 2)
            result.redirect('/admin');
        else
            result.redirect('/tickets');
    } else {
        result.redirect('/login');
    }
});

e.get('/login', function (request, result) {
    let user = authUserWithSession(request, result);
    if (user.ok) {
        if (user.role == 1)
            result.redirect('/manage');
        else if (user.role == 2)
            result.redirect('/admin');
        else
            result.redirect('/tickets');
    } else {
        result.cookie('session', '', { expires: new Date(Date.now() - 1) });
        result.render('login', {
            error: false
        });
    }
});

e.post('/login', urlencodedParser, function (request, result) {
    let user = app.authUserWithLogin(request.body.username, request.body.password);
    if (user.ok) {
        result.cookie('session', user.session);
        if (user.role == 1)
            result.redirect('/manage');
        else if (user.role == 2)
            result.redirect('/admin');
        else
            result.redirect('/tickets');
    } else {
        result.cookie('session', '', { expires: new Date(Date.now() - 1) });
        result.render('login', {
            error: "Incorrect username or password"
        });
    }
});

e.get('/logout', function (_request, result) {
    result.cookie('session', '', { expires: new Date(Date.now() - 1) });
    result.redirect('/login');
});

e.get('/admin', function (request, result) {
    let user = authUserWithSession(request, result);
    if (user.role != 2) {
        result.send('Access forbidden.');
        return;
    } else if (!user.ok) {
        result.redirect('/login');
        return;
    }
    result.render('admin', {
        tickets: app.getTickets(),
        users: app.getUsers(),
        user: user
    });
});

e.get('/manage', function (request, result) {
    let user = authUserWithSession(request, result);
    if (user.role != 1 && user.role != 2) {
        result.send('Access forbidden.');
        return;
    } else if (!user.ok) {
        result.redirect('/login');
        return;
    }
    result.render('manage', {
        tickets: app.getTickets(),
        users: app.getUsers(),
        user: user
    });
});

e.get('/tickets', function (request, result) {
    let user = authUserWithSession(request, result);
    if (user.role != 0 && user.role != 1 && user.role != 2) {
        result.send('Access forbidden.');
        return;
    } else if (!user.ok) {
        result.redirect('/login');
        return;
    }
    result.render('tickets', {
        tickets: app.getTickets(),
        users: app.getUsers(),
        user: user
    });
});

e.get('/new', function (request, result) {
    let user = authUserWithSession(request, result);
    if (user.role != 0 && user.role != 1 && user.role != 2) {
        result.send('Access forbidden.');
        return;
    } else if (!user.ok) {
        result.redirect('/login');
        return;
    }
    result.render('new', {
        user: user,
        ticket: false
    });
});

e.post('/new', urlencodedParser, function (request, result) {
    let user = authUserWithSession(request, result);
    if (user.role != 0 && user.role != 1 && user.role != 2) {
        result.send('Access forbidden.');
        return;
    } else if (!user.ok) {
        result.redirect('/login');
        return;
    }
    let ticket = app.addTicket(user.id, request.body.description);
    result.render('new', {
        user: user,
        ticket: ticket
    });
});

e.listen(3000);
