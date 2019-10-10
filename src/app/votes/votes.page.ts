import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {
  AuthenticationService, DataService, KiosksModel,
  APIService, KiosksStatusModel, VotingStatusService, VotingStatusModel,
} from '../_services/authentication.service';
import {Governorate, PollingStation, User, Wilayat} from '../_models';
import * as d3 from 'd3';

@Component({
  selector: 'app-votes',
  templateUrl: 'votes.page.html',
  styleUrls: ['votes.page.scss']
})
export class VotesPage implements AfterViewInit {
  public user = new User({});
  public users = [];
  public kiosksmodel = new KiosksModel();
  public votingstatus = new VotingStatusModel({});
  public errors = '';
  private _current: any;
  private _previous: any;
  public readonly_view = {
    governorate: false,
    wilayat: false,
    pollingstation: false
  };
  customWilayatOptions: any = {
    header: 'أختيار الولاية',
    translucent: true
  };

  constructor(public navCtrl: NavController,
              private authenticationService: AuthenticationService, public dataService: DataService,
              public votingStatusService: VotingStatusService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
    this.votingStatusService.currentDataService.subscribe( value => {
      this.votingstatus = value;
    });
    this.dataService.getWilayatFromGovernorateId(new Governorate({})).subscribe((wilayat) => {
      if (this.user.roles.name === 'high_committee' || this.user.roles.name === 'main_committee') {
        this.readonly_view.wilayat = false;
        if (wilayat && wilayat[0] && wilayat[0].id) {
          this.dataService.setWilayat(new Wilayat(wilayat[0]));
          this.getDataFromWilayatId(wilayat[0].id);
        } else {
          this.getDataFromWilayatId(this.user.wilayat.code);
        }
      } else {
        this.dataService.setWilayat(this.user.wilayat);
        this.readonly_view.wilayat = true;
        if (this.user && this.user.wilayat) {
          this.getDataFromWilayatId(this.user.wilayat.code);
        }
      }
    }, () => {});
  }

  ngAfterViewInit() {

  }
  onChangeWilayat(event: any) {
    this.dataService.onChangeWilayat(event);
    d3.select('#chart').selectAll('svg').remove();
    for (const i in this.kiosksmodel.wilayats) {
      if (event.target && this.kiosksmodel.wilayats && this.kiosksmodel.wilayats[i] && this.kiosksmodel.wilayats[i].name === event.target.value) {
        this.getDataFromWilayatId(this.kiosksmodel.wilayats[i].code);
      }
    }
  }
  getDataFromWilayatId(id) {
    this.votingStatusService.getWilayatByCode(id).subscribe((success) => {
      this.votingStatusService.getKiosksStatusByWilayatId(id, new PollingStation({}), '').subscribe((data: VotingStatusModel) => {
        this.renderChart(data.votingpercentage);
      }, errors => {
        console.log(errors);
      });
    }, errors => {
      console.log(errors);
    });
  }

  renderChart(votingpercentage: number) {
    votingpercentage = Math.round( votingpercentage * 10 ) / 10;
    const data = [
      {name: 'Voted', value: votingpercentage},
      {name: 'Remaining', value: 100 - votingpercentage}
    ];
    const text = '';

    const width = 150;
    const height = 150;
    const thickness = 14;
    const duration = 1750;

    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select('#chart')
      .append('svg')
      .attr('class', 'pie')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    const arc = d3.arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius);

    const pie = d3.pie()
      .value((d) => d.value)
      .sort(null);

    const path = g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('g')
      // .on('mouseover', function(d) {
      //   const g = d3.select(this)
      //     .style('cursor', 'pointer')
      //     .style('fill', 'black')
      //     .append('g')
      //     .attr('class', 'text-group');
      //
      //   g.append('text')
      //     .attr('class', 'name-text')
      //     .text(`${d.data.name}`)
      //     .attr('text-anchor', 'middle')
      //     .attr('dy', '-1.2em');
      //
      //   g.append('text')
      //     .attr('class', 'value-text')
      //     .text(`${d.data.value}`)
      //     .attr('text-anchor', 'middle')
      //     .attr('dy', '.6em');
      // })
      // .on('mouseout', function(d) {
      //   d3.select(this)
      //     .style('cursor', 'none')
      //     .style('fill', color(this._current))
      //     .select('.text-group').remove();
      // })
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => {
        if (i === 1) {
          return '#EEF0F4';
        } else if (i === 0) {
          return '#42CC40';
        }
      })
      // .on('mouseover', function(d) {
      //   d3.select(this)
      //     .style('cursor', 'pointer')
      //     .style('fill', 'black');
      // })
      // .on('mouseout', function(d) {
      //   d3.select(this)
      //     .style('cursor', 'none')
      //     .style('fill', color(this._current));
      // })
      .each(function(d, i) {
        this._current = i;
      });


    let f = d3.select('g')
      .append('g')
      .attr('class', 'text-group')
    f.append('text')
      .attr('class', 'value-text')
      .text(votingpercentage + `%`)
      .attr('text-anchor', 'middle')
      .attr('dy', '.28em')
      .attr('dx', '0.2em');
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .text(text);
  }
  onSelect(event) {
    console.log(event);
  }
}
