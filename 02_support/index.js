let express = require('express');
let e = express();

const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: false});

let app = require('./modules/app.js');
app.init();

e.set('view engine', 'ejs');
e.use(express.static('public'));
e.use(cookieParser());

let authUserWithSession = (request, _result) => {
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
            title: 'Login',
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
            title: 'Login',
            error: "Incorrect username or password"
        });
    }
});

e.get('/logout', function (request, result) {
    let session = request.cookies.session;
    if (session)
        app.resetSession(session);
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
        title: 'Admin panel',
        managers: app.getManagers(),
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
        title: 'Management panel',
        tickets: app.getTickets(user.id),
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
        title: 'Tickets list',
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
        title: 'Create new ticket',
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
        title: 'Create new ticket',
        user: user,
        ticket: ticket
    });
});

e.post('/api/assign/:ticketId', urlencodedParser, function (request, result) {
    let user = authUserWithSession(request, result);
    if (!user.ok || user.role != 2) {
        result.send(JSON.stringify({ ok: false }));
        return;
    }
    let response = app.assignTicket(request.params.ticketId, request.body.user_id);
    result.send(JSON.stringify(response));
});

e.post('/api/set_closed/:ticketId', urlencodedParser, function (request, result) {
    let user = authUserWithSession(request, result);
    if (!user.ok || (user.role != 1 && user.role != 2)) {
        result.send(JSON.stringify({ ok: false }));
        return;
    }
    let response = app.setTicketClosed(request.params.ticketId, request.body.is_closed);
    result.send(JSON.stringify(response));
});

e.post('/api/comment/:ticketId', urlencodedParser, function (request, result) {
    let user = authUserWithSession(request, result);
    if (!user.ok || (user.role != 1 && user.role != 2)) {
        result.send(JSON.stringify({ ok: false }));
        return;
    }
    let comment = request.body.comment ? request.body.comment : '';
    let response = app.setTicketComment(request.params.ticketId, request.body.comment);
    result.send(JSON.stringify(response));
});

e.listen(3000);
