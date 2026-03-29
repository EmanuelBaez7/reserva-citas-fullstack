using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Domain.Enums;
using ObsidianArchitect.Domain.Exceptions;

namespace ObsidianArchitect.Application.Services;

public class AuditLogService
{
    private readonly IUnitOfWork _uow;

    public AuditLogService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    /// <summary>
    /// Returns paginated, filterable audit logs for the Reservation Activity Logs screen.
    /// </summary>
    public async Task<PagedResult<AuditLogDto>> GetLogsAsync(
        int page = 1, int pageSize = 20,
        DateOnly? from = null, DateOnly? to = null,
        AuditAction? action = null, Guid? profileId = null,
        string? search = null,
        CancellationToken ct = default)
    {
        var (items, totalCount) = await _uow.AuditLogs.GetPagedAsync(
            page, pageSize, from, to, action, profileId, search, ct);

        var dtos = items.Select(l => new AuditLogDto(
            l.Id,
            l.Profile?.FullName,
            l.Profile?.Email,
            l.Profile?.AvatarUrl,
            l.Action.ToString(),
            l.EntityType,
            l.EntityId,
            l.Details,
            l.StatusLabel,
            $"res_{l.Id.ToString()[..4]}_{l.Id.ToString()[4..6]}",
            l.CreatedAt
        )).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new PagedResult<AuditLogDto>(dtos, totalCount, page, pageSize, totalPages);
    }

    /// <summary>
    /// Returns a single audit log detail.
    /// </summary>
    public async Task<AuditLogDetailDto> GetLogDetailAsync(Guid id, CancellationToken ct = default)
    {
        var log = await _uow.AuditLogs.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("AuditLog", id);

        return new AuditLogDetailDto(
            log.Id,
            log.Profile?.FullName,
            log.Profile?.Email,
            log.Action.ToString(),
            log.EntityType,
            log.EntityId,
            log.Details,
            log.IpAddress,
            log.StatusLabel,
            $"res_{log.Id.ToString()[..4]}_{log.Id.ToString()[4..6]}",
            log.CreatedAt);
    }
}
