import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const exportService = {
  // Exportar a PDF
  exportToPDF: (titulo, columnas, datos, subtitulo = '') => {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Configurar fuente
    doc.setFont('helvetica')
    
    // Título
    doc.setFontSize(20)
    doc.setTextColor(44, 62, 80)
    doc.text(titulo, 14, 20)
    
    // Subtítulo
    if (subtitulo) {
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(subtitulo, 14, 30)
    }
    
    // Fecha de generación
    const fecha = new Date().toLocaleString('es-MX')
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generado: ${fecha}`, 14, 38)
    
    // Configurar tabla
    const headers = columnas.map(col => col.titulo)
    const data = datos.map(fila => 
      columnas.map(col => {
        if (col.formato) {
          return col.formato(fila[col.campo])
        }
        if (col.render) {
          // Para valores renderizados, extraer texto
          const rendered = col.render(fila)
          if (typeof rendered === 'string') return rendered
          if (rendered?.props?.children) return rendered.props.children
          return fila[col.campo] || ''
        }
        return fila[col.campo] !== undefined ? fila[col.campo] : ''
      })
    )
    
    // Agregar tabla
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 45,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 45, left: 14, right: 14 }
    })
    
    // Guardar PDF
    doc.save(`${titulo.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
  },

  // Exportar a Excel
  exportToExcel: (titulo, columnas, datos) => {
    // Preparar datos para Excel
    const headers = columnas.map(col => col.titulo)
    
    const rows = datos.map(fila => 
      columnas.map(col => {
        if (col.formato) {
          return col.formato(fila[col.campo])
        }
        if (col.render) {
          const rendered = col.render(fila)
          if (typeof rendered === 'string') return rendered
          if (rendered?.props?.children) return rendered.props.children
          return fila[col.campo] || ''
        }
        return fila[col.campo] !== undefined ? fila[col.campo] : ''
      })
    )
    
    const worksheetData = [headers, ...rows]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // Ajustar ancho de columnas
    const colWidths = headers.map((header, idx) => {
      const maxLength = Math.max(
        header.length,
        ...rows.map(row => String(row[idx] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = colWidths
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, titulo)
    
    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${titulo.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
  },

  // Exportar a CSV
  exportToCSV: (titulo, columnas, datos) => {
    const headers = columnas.map(col => col.titulo).join(',')
    
    const rows = datos.map(fila => {
      return columnas.map(col => {
        let value
        if (col.formato) {
          value = col.formato(fila[col.campo])
        } else if (col.render) {
          const rendered = col.render(fila)
          if (typeof rendered === 'string') value = rendered
          else if (rendered?.props?.children) value = rendered.props.children
          else value = fila[col.campo]
        } else {
          value = fila[col.campo]
        }
        
        // Escapar comillas y saltos de línea
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`
          }
        }
        return value !== undefined && value !== null ? value : ''
      }).join(',')
    })
    
    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${titulo.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
  }
}