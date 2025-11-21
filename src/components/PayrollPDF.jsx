import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuente (opcional, usaremos Helvetica por defecto que es limpia)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0891b2', // Cyan-600
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b', // Slate-800
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b', // Slate-500
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Slate-200
    paddingVertical: 5,
    alignItems: 'center',
  },
  colLabel: {
    width: '60%',
    fontSize: 10,
    color: '#334155', // Slate-700
  },
  colValue: {
    width: '40%',
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#0f172a', // Slate-900
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0891b2', // Cyan-600
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#0891b2',
  },
  totalLabel: {
    width: '60%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValue: {
    width: '40%',
    fontSize: 14,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#0891b2',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
  deductionValue: {
    color: '#e11d48', // Rose-600
  }
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const PayrollPDF = ({ payroll, period }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Nómina HAMB</Text>
            <Text style={styles.subtitle}>Resumen de Pago</Text>
        </View>
        <View>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Periodo: {period.start} - {period.end}</Text>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Generado: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {/* DEVENGADOS */}
        <View style={styles.column}>
            <Text style={styles.sectionTitle}>Devengados</Text>
            
            <View style={styles.row}>
                <Text style={styles.colLabel}>Salario Básico ({payroll.diasTrabajadosFisicos}d)</Text>
                <Text style={styles.colValue}>{formatCurrency(payroll.pagoBasico)}</Text>
            </View>

            {payroll.pagoRemoto > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Trabajo Remoto ({payroll.diasRemoto}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoRemoto)}</Text>
                </View>
            )}

            {payroll.pagoCitaMedica > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Cita Médica ({payroll.diasCitaMedica}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoCitaMedica)}</Text>
                </View>
            )}

            {payroll.pagoPermisoRem > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Permiso Remunerado ({payroll.diasPermisoRem}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoPermisoRem)}</Text>
                </View>
            )}

            {payroll.pagoVacaciones > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Vacaciones ({payroll.diasVacaciones}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoVacaciones)}</Text>
                </View>
            )}

            {payroll.pagoVacacionesResto > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Vacaciones No Hábiles ({payroll.diasVacacionesResto}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoVacacionesResto)}</Text>
                </View>
            )}

            {payroll.pagoIncapacidad > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Incapacidad ({payroll.diasIncapacidad}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoIncapacidad)}</Text>
                </View>
            )}

            {payroll.pagoLicRemun > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Licencia Remunerada ({payroll.diasLicRemun}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoLicRemun)}</Text>
                </View>
            )}

            {payroll.pagoLeyMaria > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Ley María ({payroll.diasLeyMaria}d)</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.pagoLeyMaria)}</Text>
                </View>
            )}

            <View style={styles.row}>
                <Text style={styles.colLabel}>Bono Extralegal ({payroll.diasParaBono}d)</Text>
                <Text style={styles.colValue}>{formatCurrency(payroll.bonoReal)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.colLabel}>Aux. Alimentación ({payroll.diasParaAlimentacion}d)</Text>
                <Text style={styles.colValue}>{formatCurrency(payroll.auxAlimReal)}</Text>
            </View>

            {payroll.safeOtros > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Otros Ingresos</Text>
                    <Text style={styles.colValue}>{formatCurrency(payroll.safeOtros)}</Text>
                </View>
            )}

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL DEVENGADO</Text>
                <Text style={styles.totalValue}>{formatCurrency(payroll.devengado)}</Text>
            </View>
        </View>

        {/* DEDUCCIONES */}
        <View style={styles.column}>
            <Text style={[styles.sectionTitle, { color: '#e11d48' }]}>Deducciones</Text>
            
            <View style={styles.row}>
                <Text style={styles.colLabel}>Salud (4%)</Text>
                <Text style={[styles.colValue, styles.deductionValue]}>- {formatCurrency(payroll.salud)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.colLabel}>Pensión (4%)</Text>
                <Text style={[styles.colValue, styles.deductionValue]}>- {formatCurrency(payroll.pension)}</Text>
            </View>

            {payroll.safeFunebres > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Seguro Exequial</Text>
                    <Text style={[styles.colValue, styles.deductionValue]}>- {formatCurrency(payroll.safeFunebres)}</Text>
                </View>
            )}

            {payroll.safePrestamos > 0 && (
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Préstamos / Deudas</Text>
                    <Text style={[styles.colValue, styles.deductionValue]}>- {formatCurrency(payroll.safePrestamos)}</Text>
                </View>
            )}

            {/* Informativos de días no pagados */}
            {payroll.diasPermisoNoRem > 0 && (
                <View style={styles.row}>
                    <Text style={[styles.colLabel, { color: '#94a3b8' }]}>Permiso No Rem. ({payroll.diasPermisoNoRem}d)</Text>
                    <Text style={[styles.colValue, { color: '#94a3b8' }]}>$0</Text>
                </View>
            )}
            {payroll.diasNoRemun > 0 && (
                <View style={styles.row}>
                    <Text style={[styles.colLabel, { color: '#94a3b8' }]}>No Remun. ({payroll.diasNoRemun}d)</Text>
                    <Text style={[styles.colValue, { color: '#94a3b8' }]}>$0</Text>
                </View>
            )}

            <View style={[styles.totalRow, { borderTopColor: '#e11d48' }]}>
                <Text style={styles.totalLabel}>TOTAL DEDUCCIONES</Text>
                <Text style={[styles.totalValue, { color: '#e11d48' }]}>- {formatCurrency(payroll.deducciones)}</Text>
            </View>
        </View>
      </View>

      {/* NETO A PAGAR */}
      <View style={{ marginTop: 30, padding: 20, backgroundColor: '#f8fafc', borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5 }}>Neto a Pagar</Text>
        <Text style={{ fontSize: 32, fontWeight: 'black', color: '#0f172a' }}>{formatCurrency(payroll.neto)}</Text>
      </View>

      <Text style={styles.footer}>
        Este documento es un comprobante generado automáticamente por Nómina HAMB Inteligente.
      </Text>
    </Page>
  </Document>
);
