$( function () {
    $('.table_class').DataTable( {
   responsive: true,
   pageLength: 30,
   deferRender: true,
   autoWidth: false,
   // Hide alias column
   columnDefs: [
    { "visible": false, "targets": 3 }
  ]
} );
    // Setup - add a text input to each footer cell
    $('.table_class tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
    } );
    // Move search fields to the top of the table
    $('.table_class tfoot tr').appendTo('.table_class thead');
    // DataTable
    var table = $('.table_class').DataTable();
    // Apply the search
    table.columns().every( function () {
        var that = this;
 
        $( 'input', this.footer() ).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        } );
    } );
});

$( function () {
    $('.table_status').DataTable( {
   responsive: true,
   pageLength: 30,
   deferRender: true,
   autoWidth: false,
   // Hide alias column
   columnDefs: [
    { "visible": false, "targets": 3 }
  ]
} );
});