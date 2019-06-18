import $ from './jquery-es';
import 'bootstrap';
import moment from 'moment';
import _ from 'lodash';

$(document).ready(function() {
  let employeesModel = [];

  function initializeEmployeesModel() {
    $.get(`https://calm-gorge-86980.herokuapp.com/employees`)
      .done(function(data) {
        employeesModel = data;
        refreshEmployeeRows(employeesModel);
      })
      .fail(function() {
        showGenericModal('Error', 'Unable to get Employees');
      });
  }

  function refreshEmployeeRows(employees) {
    $('#employees-table').empty();

    employees.forEach(function(emp) {
      const templateEmployee = $(
        `<div class="row body-row" data-id="${emp._id}"> <div class="col-xs-4 body-column">${
          emp.FirstName
        }</div> <div class="col-xs-4 body-column">${
          emp.LastName
        }</div><div class="col-xs-4 body-column">${emp.Position.PositionName}</div></div>`
      );
      $('#employees-table').append(templateEmployee);
    });
  }

  function randomGlyph() {
    let glyphs = [
      'glyphicon glyphicon-send',
      'glyphicon glyphicon-sunglasses',
      'glyphicon glyphicon-king',
      'glyphicon glyphicon-bitcoin'
    ];
    return `<span class="${glyphs[Math.round(Math.random(0, 1) * 3)]}" aria-hidden="true"></span> `;
  }

  function showGenericModal(title, body) {
    $('.modal-title').html(randomGlyph() + title);
    $('.modal-body').html(body);
    $('#genericModal').modal();
  }

  function getFilteredEmployeesModel(filterString) {
    let filteredEmployeesModel = _.filter(employeesModel, function(employee) {
      return (
        checkFilter(employee.FirstName, filterString) ||
        checkFilter(employee.LastName, filterString) ||
        checkFilter(employee.Position.PositionName, filterString)
      );
    });

    return filteredEmployeesModel;
  }

  let checkFilter = (str, filterStr) => str.toLowerCase().includes(filterStr.toLowerCase());

  function getEmployeeModelById(id) {
    let filteredEmployeeById = _.filter(employeesModel, function(employee) {
      return employee._id === id;
    });

    if (filteredEmployeeById.length === 0) {
      return null;
    }

    return _.cloneDeep(filteredEmployeeById[0]);
  }

  initializeEmployeesModel();

  $('#employee-search').keyup(function() {
    refreshEmployeeRows(getFilteredEmployeesModel($('#employee-search').val()));
  });

  $(document).on('click', '.body-row', function() {
    let employee = getEmployeeModelById($(this).attr('data-id'));
    employee.hireDateFormat = moment(employee.HireDate).format('LL');

    let employeeTemplate = _.template(
      '<span class="glyphicon glyphicon-home" aria-hidden="true"></span><strong> Address:</strong> <%- emp.AddressStreet %>, <%- emp.AddressCity %>, <%- emp.AddressState %>, <%- emp.AddressZip%><br> <span class="glyphicon glyphicon-earphone" aria-hidden="true"></span><strong> Phone Number:</strong> <%- emp.PhoneNum %> ext: <%- emp.Extension %><br> <span class="glyphicon glyphicon-calendar" aria-hidden="true"></span><strong> Hire Date:</strong> <%- emp.hireDateFormat %>'
    );
    let employeeTemplateResult = employeeTemplate({ emp: employee });

    showGenericModal(`${employee.FirstName} ${employee.LastName}`, employeeTemplateResult);
  });
});
