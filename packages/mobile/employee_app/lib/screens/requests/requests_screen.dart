import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/request_provider.dart';
import '../../widgets/request_card.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({super.key});

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RequestProvider>().loadRequests();
    });
  }

  void _showNewRequestDialog() {
    final typeController = TextEditingController();
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    String selectedType = 'vacation';

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Nova Solicitação'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: selectedType,
                decoration: const InputDecoration(labelText: 'Tipo'),
                items: const [
                  DropdownMenuItem(value: 'vacation', child: Text('Férias')),
                  DropdownMenuItem(value: 'time_off', child: Text('Folga')),
                  DropdownMenuItem(value: 'medical', child: Text('Atestado Médico')),
                  DropdownMenuItem(value: 'personal', child: Text('Assunto Pessoal')),
                  DropdownMenuItem(value: 'overtime', child: Text('Hora Extra')),
                  DropdownMenuItem(value: 'benefit', child: Text('Benefício')),
                  DropdownMenuItem(value: 'other', child: Text('Outro')),
                ],
                onChanged: (v) => selectedType = v ?? 'vacation',
              ),
              const SizedBox(height: 12),
              TextField(
                controller: titleController,
                decoration: const InputDecoration(labelText: 'Título'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Descrição'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () async {
              final provider = context.read<RequestProvider>();
              final success = await provider.createRequest({
                'type': selectedType,
                'title': titleController.text,
                'description': descriptionController.text,
                'start_date': DateTime.now().toIso8601String(),
              });
              if (success && mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Solicitação criada!'), backgroundColor: AppTheme.success),
                );
              }
            },
            child: const Text('Enviar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final requestProvider = context.watch<RequestProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Solicitações'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.filter_list),
                onPressed: () => requestProvider.loadPendingRequests(),
              ),
            ],
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showNewRequestDialog,
        icon: const Icon(Icons.add),
        label: const Text('Nova Solicitação'),
        backgroundColor: AppTheme.primaryGreen,
      ),
      body: requestProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : requestProvider.requests.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.description_outlined, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 16),
                      Text('Nenhuma solicitação',
                          style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textSecondary)),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _showNewRequestDialog,
                        icon: const Icon(Icons.add),
                        label: const Text('Nova Solicitação'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => requestProvider.loadRequests(),
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 80),
                    itemCount: requestProvider.requests.length,
                    itemBuilder: (context, index) {
                      final request = requestProvider.requests[index];
                      return RequestCard(
                        title: request.title,
                        type: request.typeLabel,
                        typeIcon: request.typeIcon,
                        status: request.statusLabel,
                        date: request.periodFormatted,
                        isPending: request.status == 'pending',
                        onTap: () => _showRequestDetail(request),
                      );
                    },
                  ),
                ),
    );
  }

  void _showRequestDetail(request) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.description_outlined, color: AppTheme.primaryGreen),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(request.title,
                          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                      Text(request.typeLabel,
                          style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(request.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(request.statusLabel,
                      style: GoogleFonts.inter(fontSize: 12, color: _getStatusColor(request.status))),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text('Período: ${request.periodFormatted}',
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
            const SizedBox(height: 8),
            Text(request.description,
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textPrimary)),
            if (request.status == 'pending') ...[
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    context.read<RequestProvider>().cancelRequest(request.id);
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.cancel_outlined, color: AppTheme.error),
                  label: const Text('Cancelar Solicitação', style: TextStyle(color: AppTheme.error)),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.error)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'approved': return AppTheme.success;
      case 'pending': return AppTheme.warning;
      case 'rejected': return AppTheme.error;
      case 'cancelled': return AppTheme.textSecondary;
      default: return AppTheme.textSecondary;
    }
  }
}
