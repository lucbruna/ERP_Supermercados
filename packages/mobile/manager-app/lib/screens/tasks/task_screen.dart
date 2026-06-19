import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../config/theme.dart';
import '../../providers/task_provider.dart';
import '../../widgets/offline_banner.dart';

class TaskScreen extends StatefulWidget {
  const TaskScreen({super.key});

  @override
  State<TaskScreen> createState() => _TaskScreenState();
}

class _TaskScreenState extends State<TaskScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedStatus = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskProvider>().loadTasks();
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _showCreateDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nova Tarefa'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Título'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Descrição'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () async {
              if (_titleController.text.isEmpty) return;
              final provider = context.read<TaskProvider>();
              await provider.createTask({
                'title': _titleController.text,
                'description': _descController.text,
              });
              if (ctx.mounted) Navigator.pop(ctx);
              _titleController.clear();
              _descController.clear();
            },
            child: const Text('Criar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tarefas'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (v) {
              _selectedStatus = v;
              context.read<TaskProvider>().loadTasks(status: v.isEmpty ? null : v);
            },
            itemBuilder: (_) => [
              const PopupMenuItem(value: '', child: Text('Todas')),
              const PopupMenuItem(value: 'pending', child: Text('Pendentes')),
              const PopupMenuItem(value: 'in_progress', child: Text('Em Andamento')),
              const PopupMenuItem(value: 'completed', child: Text('Concluídas')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          const ManagerOfflineBanner(),
          Expanded(
            child: Consumer<TaskProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.tasks.isEmpty) {
                  return _buildShimmer();
                }
                if (provider.error != null && provider.tasks.isEmpty) {
                  return _buildError(provider);
                }
                if (provider.tasks.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.checklist, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text('Nenhuma tarefa encontrada', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                        const SizedBox(height: 8),
                        ElevatedButton.icon(
                          onPressed: _showCreateDialog,
                          icon: const Icon(Icons.add),
                          label: const Text('Criar Tarefa'),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => provider.loadTasks(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.tasks.length,
                    itemBuilder: (context, index) {
                      final task = provider.tasks[index] as Map<String, dynamic>;
                      final id = task['id'] ?? 0;
                      final title = task['title'] ?? task['titulo'] ?? '';
                      final description = task['description'] ?? task['descricao'] ?? '';
                      final status = task['status'] ?? 'pending';
                      final assignedTo = task['assigned_to'] ?? task['responsavel'] ?? '';

                      Color statusColor;
                      IconData statusIcon;
                      switch (status) {
                        case 'completed':
                          statusColor = AppTheme.success;
                          statusIcon = Icons.check_circle;
                          break;
                        case 'in_progress':
                          statusColor = AppTheme.primaryColor;
                          statusIcon = Icons.play_circle;
                          break;
                        default:
                          statusColor = AppTheme.warning;
                          statusIcon = Icons.pending;
                      }

                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                            child: Icon(statusIcon, color: statusColor, size: 22),
                          ),
                          title: Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                          subtitle: description.isNotEmpty
                              ? Text(description, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary), maxLines: 1)
                              : null,
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (assignedTo.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(right: 4),
                                  child: Text(assignedTo, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
                                ),
                              IconButton(
                                icon: Icon(status == 'completed' ? Icons.undo : Icons.check_circle_outline, size: 20),
                                color: status == 'completed' ? AppTheme.textSecondary : AppTheme.success,
                                onPressed: () {
                                  if (status != 'completed') {
                                    provider.completeTask(id is int ? id : int.tryParse(id.toString()) ?? 0);
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(6, (_) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          height: 72,
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        )),
      ),
    );
  }

  Widget _buildError(TaskProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off, size: 64, color: AppTheme.textSecondary),
          const SizedBox(height: 16),
          Text(provider.error!, style: GoogleFonts.inter(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => provider.loadTasks(),
            icon: const Icon(Icons.refresh),
            label: const Text('Tentar Novamente'),
          ),
        ],
      ),
    );
  }
}
