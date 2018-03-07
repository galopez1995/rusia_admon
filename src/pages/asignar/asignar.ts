import {Component} from '@angular/core';
import {Storage} from '@ionic/storage';
import {NavController, NavParams, AlertController} from 'ionic-angular';
import {global} from '../../components/credenciales/credenciales';
import {TabsPage} from '../../pages/tabs/tabs';
import {AsignarDetailPage} from '../../pages/asignar-detail/asignar-detail';

declare var OdooApi: any;
@Component({
    selector: 'page-asignar',
    templateUrl: 'asignar.html',
})
export class AsignarPage {

    mensaje = '';
    cargar = true;
    viewTitle = '';
    calendar = {
        eventSource: [],
        mode: 'month',
        currentDate: new Date(),
        formatDayHeader: 'E',
        noEventsLabel: 'Sin Eventos',
        formatMonthTitle: 'MMMM yyyy',
        allDayLabel: 'Todo el día',
        formatWeekTitle: 'MMMM yyyy, Se $n'
    };
    item;
    tours;
    events = [];
    add = true;
    constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private storage: Storage) {

    }

    ionViewDidLoad() {

        this.cargarSinDatos();
    }

    cargarConDatos() {
        var self = this;
        this.storage.get('conexion').then((conexion) => {

            self.item = self.navParams.get('item');
            console.log(conexion);

            if (conexion.is_chofer || conexion.is_guia || conexion.is_promotor) {
                self.add = false
            }

            var odoo = new OdooApi(global.url, conexion.bd);
            self.cargar = true; 
            self.calendar.eventSource = [];
            self.events = [];
            odoo.login(conexion.username, conexion.password).then(
                function (uid) {

                    //try to save data 
                    self.storage.get('offline').then((offline) => {

                        if (offline != null) {
                            for (let key in offline) {
                                (function (key) {
                                    if (offline[key].operacion == 'create') {

                                        odoo.create(offline[key].tabla, offline[key].dato).then(
                                            function (ok_code) {

                                            },
                                            function () {
                                                console.log('imposible guardar datos:');
                                                console.log(offline[key])
                                            }
                                        );

                                    } else if (offline[key].operacion == 'write') {

                                        odoo.write(offline[key].tabla, offline[key].id, offline[key].dato).then(
                                            function (ok_code) {

                                            },
                                            function () {
                                                console.log('imposible guardar datos:');
                                                console.log(offline[key])
                                            }
                                        );
                                    }
                                })(key);
                            }

                        }

                        odoo.search_read('tours.guia', [['date_begin', '>=', '2017-12-01']], ['id', 'guia_id', 'tour_id', 'date_begin',
                            'date_end', 'personas_terceros', 'personas_all_in', 'total_personas', 'total_rublo', 'total_dolar', 'total_euro', 'total_rublo_res'
                            , 'total_euro_res', 'total_dolar_res', 'pay_pal', 'tarjeta', 'is_free', 'personas_pago', 'is_private', 'entregado', 'state', 'observaciones']).then(
                            function (guia) {

                                console.log(guia);
                                var ids = [];
                                for (var key in guia) {
                                    var dateStart = new Date(String((guia[key]).date_begin).replace(' ', 'T'));
                                    var dateEnd = new Date(String((guia[key]).date_end).replace(' ', 'T'));
                                    var startTime = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), dateStart.getHours(), dateStart.getMinutes());
                                    var endTime = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate(), dateEnd.getHours(), dateEnd.getMinutes());
                                    guia[key].startTime = startTime;
                                    guia[key].endTime = endTime;
                                    guia[key].title = (guia[key]).tour_id[1];
                                    guia[key].allDay = false;
                                    guia[key].reservas = [];
                                    guia[key].futuras = [];
                                    guia[key].guia_id = guia[key].guia_id ? guia[key].guia_id : '';
                                    guia[key].observaciones = guia[key].observaciones ? guia[key].observaciones : '';
                                    guia[key].no_editable = self.add;

                                    ids.push(guia[key].id);
                                }
                                console.log(ids)
                                odoo.search_read('tours.clientes.middle', [['guia_id', 'in', ids]],
                                    ['tour_id', 'guia_id', 'name', 'telefono', 'email',
                                        'nombre_hotel', 'padrino', 'personas_terceros', 'personas_all_in', 'total_personas', 'personas_pago',
                                        'abonor_rublo', 'abono_euros', 'abono_dolar', 'dolar_exportado', 'euros_exportado', 'rublo_exportado', 'pay_pal', 'tarjeta', 'asistencia', 'observaciones', 'fecha']).then(

                                    function (middle) {
                                        //                                    self.storage.set('middle', middle);
                                        console.log(middle);
                                        for (var key in guia) {

                                            for (var key2 in middle) {
                                                if (guia[key].tour_id[0] == middle[key2].tour_id[0] && String((guia[key]).date_begin).substring(0, 10) == String(middle[key2].fecha)) {
                                                    guia[key].reservas.push(middle[key2]);
                                                    //console.log(middle[key2]);
                                                }
                                            }
                                            //                                        self.events.push(guia[key]);

                                        }
                                        console.log(ids);
                                        odoo.search_read('tours.clientes.reservar.futuras', [['guia_id', 'in', ids]],
                                            ['tour_id', 'guia_id', 'name', 'telefono', 'email',
                                                'nombre_hotel', 'personas_terceros', 'personas_all_in', 'total_personas', 'personas_pago',
                                                'abonor_rublo', 'abono_euros', 'abono_dolar', 'is_sim', 'is_museo', 'hotel', 'pay_pal', 'tarjeta', 'observaciones', 'fecha']).then(

                                            function (futuras) {

                                                console.log(futuras)
                                                for (var key_g in guia) {

                                                    for (var key_f in futuras) {
                                                        //guia[key].reserva_id = middle[key2].id;
                                                        //                                                    if (guia[key_g].tour_id[0] == futuras[key_f].tour_id[0]) {
                                                        guia[key_g].futuras.push(futuras[key_f]);
                                                        //console.log(middle[key2]);
                                                        //                                                    }
                                                    }
                                                    self.events.push(guia[key_g]);
                                                }
                                                console.log(futuras);
                                                console.log(guia);
                                                self.storage.set('guia', self.events);
                                                self.cargar = false;
                                                self.calendar.eventSource = self.events;
                                                odoo.search_read('tours.clientes', [['id', '!=', 0]],
                                                    ['name', 'telefono', 'nombre_hotel', 'email', 'is_padrino', 'active_email', 'pago_tarjeta', 'padre', 'observaciones']).then(
                                                    function (clientes) {
                                                        console.log(clientes)
                                                        self.storage.set('clientes', clientes);//<--Todos los clientes Clientes  
                                                        self.storage.get('conexion').then((val_p) => {
                                                            console.log('muestre val_p 2')
                                                            console.log(val_p)
                                                        })
                                                        odoo.search_read('tours.clientes.email', [['id', '!=', 0]],
                                                            ['name']).then(
                                                            function (email) {
                                                                console.log(email)
                                                                self.storage.set('email', email);//<--Todos los emails
                                                                var consulta;
                                                                if (conexion.tipo_a == 'xciudad') {
                                                                    consulta = [['administrador', '=', uid]]
                                                                } else {
                                                                    consulta = [['id', '!=', '0']]
                                                                }
                                                                odoo.search_read('tours.companies', consulta, ['name', 'administrador']).then(
                                                                    function (companies) {
                                                                        console.log(companies);
                                                                        self.storage.set('companies', companies); //<--- Todas las Ciudades
                                                                        var ban = true;

                                                                        for (var key = 0; companies.length > key; key++) {

                                                                            (function (key) {
                                                                                console.log(key);

                                                                                if (companies[key].administrador[0] == uid) {
                                                                                    odoo.search_read('res.users', [['city_id', '=', companies[key].name[0]], ['active', '=', 1]],
                                                                                        ['name']).then(
                                                                                        function (guias) {
                                                                                            console.log(guias)
                                                                                            self.storage.set('guias', guias);//<--Guias si los hay                      
                                                                                        }, function () {
                                                                                            self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                                                                                            self.cargar = false;
                                                                                        }
                                                                                        )
                                                                                }
                                                                            })(key);
                                                                        }

                                                                        

                                                                    },
                                                                    function () {
                                                                        self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                                                                        self.cargar = false;
                                                                    });

                                                            }, function () {
                                                                self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                                                                self.cargar = false;
                                                            }
                                                            )

                                                    }, function () {
                                                        self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                                                        self.cargar = false;
                                                    }
                                                    )

                                            },
                                            function () {
                                                self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                                                self.cargar = false;
                                            }
                                            );

                                    },
                                    function () {
                                        self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                                        self.cargar = false;
                                    }
                                    );
                            },
                            function () {
                                self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                                self.cargar = false;
                            }
                            )
                    })

                },
                function () {
                    self.presentAlert('Falla', 'Imposible Cargar Informacion.');
                    self.cargar = false;
                }
            );
        });

    }

    cargarSinDatos() {

        var self = this;
        self.cargar = true;
        self.calendar.eventSource = [];
        self.events = [];
        this.storage.get('guia').then((guia) => {
            if (guia != null) {
                
                self.cargar = false;
                self.calendar.eventSource = guia;
            } else {
                self.cargarConDatos();
            }
        });

    }

    presentAlert(titulo, texto) {
        const alert = this.alertCtrl.create({
            title: titulo,
            subTitle: texto,
            buttons: ['Ok']
        });
        alert.present();
    }
    refresh() {
        this.cargarConDatos();
    }

    onViewTitleChanged(title) {
        this.viewTitle = title;
    }

    changeMode(mode) {
        this.calendar.mode = mode;
    }

    today() {
        this.calendar.currentDate = new Date();
    }
    onEventSelected(evt) {
        console.log(evt);
        this.navCtrl.push(TabsPage, {item: evt});
    }
    addEvent() {
        this.navCtrl.push(AsignarDetailPage, false);
    }
}
