#==============================================================================
# P3D Engine - RPG Maker XP / RGSS1
#------------------------------------------------------------------------------
# First-person pseudo-3D renderer built around the real RMXP map data.
#
# Public entry points:
#   P3D.start
#   P3D.stop
#   P3D.running?
#
# Controls while active:
#   Arrow Up / Down   forward / backward
#   Arrow Left/Right  turn
#   F6                exit
#
# The renderer uses the existing XP tileset, autotile and character assets.
#==============================================================================

module P3D

  SCREEN_W = 160
  SCREEN_H = 120
  SCALE = 4

  FOV = 60.0
  MOVE_SPEED = 0.075
  TURN_SPEED = 0.055
  MAX_DEPTH = 32.0
  COLLISION = 0.16

  SKY_TOP = Color.new(34, 39, 54)
  SKY_BOTTOM = Color.new(92, 96, 108)
  FLOOR_TOP = Color.new(67, 60, 53)
  FLOOR_BOTTOM = Color.new(29, 27, 25)
  FOG_COLOR = Color.new(42, 45, 52)

  @@scene = nil

  def self.clamp(v, lo, hi)
    return lo if v < lo
    return hi if v > hi
    return v
  end

  def self.start
    return if @@scene != nil
    @@scene = Scene.new
    begin
      @@scene.main
    ensure
      @@scene.dispose if @@scene != nil
      @@scene = nil
    end
  end

  def self.stop
    return if @@scene == nil
    @@scene.request_stop
  end

  def self.running?
    return @@scene != nil
  end

  class Camera
    attr_accessor :x
    attr_accessor :y
    attr_accessor :angle

    def initialize
      @x = 0.0
      @y = 0.0
      @angle = 0.0
      sync
    end

    def sync
      return unless $game_player
      @x = $game_player.x + 0.5
      @y = $game_player.y + 0.5
      case $game_player.direction
      when 2
        @angle = Math::PI / 2.0
      when 4
        @angle = Math::PI
      when 6
        @angle = 0.0
      when 8
        @angle = -Math::PI / 2.0
      end
    end
  end

  class World

    def initialize
      @map = $game_map
      @tileset = $data_tilesets[@map.tileset_id]
      @last_step_x = 0
      @last_step_y = 0
    end

    def width
      @map.width
    end

    def height
      @map.height
    end

    def valid?(x, y)
      return false if x < 0 || y < 0
      return false if x >= width || y >= height
      true
    end

    def tile_id(x, y, layer)
      return 0 unless valid?(x, y)
      id = @map.data[x, y, layer]
      return 0 if id == nil
      id
    end

    def layers(x, y)
      [tile_id(x, y, 0), tile_id(x, y, 1), tile_id(x, y, 2)]
    end

    def passage(id)
      return 0 if id == nil || id <= 0
      begin
        return @tileset.passages[id]
      rescue
        return 0
      end
    end

    def priority(id)
      return 0 if id == nil || id <= 0
      begin
        return @tileset.priorities[id]
      rescue
        return 0
      end
    end

    def blocking_tile(x, y, dir)
      return nil unless valid?(x, y)

      bit =
        case dir
        when 2 then 0x01
        when 4 then 0x02
        when 6 then 0x04
        when 8 then 0x08
        else 0
        end

      2.downto(0) do |z|
        id = tile_id(x, y, z)
        next if id == 0
        flags = passage(id)
        return id if (flags & 0x0f) == 0x0f
        return id if (flags & bit) != 0
        next if priority(id) == 0
      end

      nil
    end

    def edge(x, y, side)
      if side == 0
        if @last_step_x > 0
          id = blocking_tile(x, y, 4)
          return [id, 4] if id != nil
          if valid?(x - 1, y)
            id = blocking_tile(x - 1, y, 6)
            return [id, 6] if id != nil
          end
        else
          id = blocking_tile(x, y, 6)
          return [id, 6] if id != nil
          if valid?(x + 1, y)
            id = blocking_tile(x + 1, y, 4)
            return [id, 4] if id != nil
          end
        end
      else
        if @last_step_y > 0
          id = blocking_tile(x, y, 8)
          return [id, 8] if id != nil
          if valid?(x, y - 1)
            id = blocking_tile(x, y - 1, 2)
            return [id, 2] if id != nil
          end
        else
          id = blocking_tile(x, y, 2)
          return [id, 2] if id != nil
          if valid?(x, y + 1)
            id = blocking_tile(x, y + 1, 8)
            return [id, 8] if id != nil
          end
        end
      end
      nil
    end

    def set_step_x(v)
      @last_step_x = v
    end

    def set_step_y(v)
      @last_step_y = v
    end
  end

  class Textures

    AUTO_INDEX = [
      [27,28,33,34], [5,28,33,34], [27,6,33,34], [5,6,33,34],
      [27,28,33,12], [5,28,33,12], [27,6,33,12], [5,6,33,12],
      [27,28,11,34], [5,28,11,34], [27,6,11,34], [5,6,11,34],
      [27,28,11,12], [5,28,11,12], [27,6,11,12], [5,6,11,12],
      [25,26,31,32], [25,6,31,32], [25,26,31,12], [25,6,31,12],
      [15,16,21,22], [15,16,21,12], [15,16,11,22], [15,16,11,12],
      [29,30,35,36], [29,30,11,36], [5,30,35,36], [5,30,11,36],
      [39,40,45,46], [5,40,45,46], [39,6,45,46], [5,6,45,46],
      [25,30,31,36], [15,16,45,46], [13,14,19,20], [13,14,19,12],
      [17,18,23,24], [17,18,11,24], [41,42,47,48], [5,42,47,48],
      [37,38,43,44], [37,6,43,44], [13,18,19,24], [13,14,43,44],
      [37,42,43,48], [17,18,47,48], [13,18,43,48], [13,18,43,48]
    ]

    def initialize(world)
      @world = world
      @tileset_bitmap = RPG::Cache.tileset(
        $data_tilesets[$game_map.tileset_id].tileset_name
      )
      @autotile_cache = {}
      @tile_cache = {}
      @character_cache = {}
    end

    def regular_tile(id)
      return @tile_cache[id] if @tile_cache.include?(id)

      index = id - 384
      return nil if index < 0

      x = (index % 8) * 32
      y = (index / 8) * 32
      rect = Rect.new(x, y, 32, 32)

      @tile_cache[id] = [@tileset_bitmap, rect]
      @tile_cache[id]
    end

    def autotile_name(id)
      slot = (id / 48) - 1
      return nil if slot < 0 || slot > 6

      name = $data_tilesets[$game_map.tileset_id].autotile_names[slot]
      return nil if name == nil || name == ''
      name
    end

    def autotile(id)
      variant = id % 48
      name = autotile_name(id)
      return nil if name == nil

      raw = RPG::Cache.autotile(name)
      frame_count = 1
      frame_count = raw.width / 96 if raw.width >= 96
      frame = (Graphics.frame_count / 8) % frame_count

      key = id.to_s + ':' + frame.to_s
      return @autotile_cache[key] if @autotile_cache.include?(key)

      if raw.height == 32
        bm = Bitmap.new(32, 32)
        bm.blt(0, 0, raw, Rect.new(frame * 32, 0, 32, 32))
        @autotile_cache[key] = [bm, Rect.new(0, 0, 32, 32)]
        return @autotile_cache[key]
      end

      pieces = AUTO_INDEX[variant]
      return nil if pieces == nil

      bm = Bitmap.new(32, 32)

      4.times do |i|
        n = pieces[i] - 1
        sx = (n % 6) * 16 + frame * 96
        sy = (n / 6) * 16
        dx = (i % 2) * 16
        dy = (i / 2) * 16
        bm.blt(dx, dy, raw, Rect.new(sx, sy, 16, 16))
      end

      @autotile_cache[key] = [bm, Rect.new(0, 0, 32, 32)]
      @autotile_cache[key]
    end

    def tile(id)
      return nil if id == nil || id == 0
      return autotile(id) if id < 384
      regular_tile(id)
    end

    def character(name, hue)
      return nil if name == nil || name == ''
      key = name.to_s + ':' + hue.to_s
      return @character_cache[key] if @character_cache.include?(key)

      begin
        bm = RPG::Cache.character(name, hue)
        @character_cache[key] = bm
        return bm
      rescue
        return nil
      end
    end
  end

  class Renderer

    attr_reader :bitmap
    attr_reader :zbuffer

    def initialize(camera, world)
      @camera = camera
      @world = world
      @textures = Textures.new(world)
      @bitmap = Bitmap.new(SCREEN_W, SCREEN_H)
      @zbuffer = Array.new(SCREEN_W, MAX_DEPTH)
    end

    def dispose
      @bitmap.dispose unless @bitmap.disposed?
    end

    def render
      draw_sky
      cast_walls
      draw_floor
      draw_events
    end

    def draw_sky
      horizon = SCREEN_H / 2

      y = 0
      while y < horizon
        t = y.to_f / [horizon - 1, 1].max
        r = P3D.clamp(
          (SKY_TOP.red + (SKY_BOTTOM.red - SKY_TOP.red) * t).to_i,
          0, 255
        )
        g = P3D.clamp(
          (SKY_TOP.green + (SKY_BOTTOM.green - SKY_TOP.green) * t).to_i,
          0, 255
        )
        b = P3D.clamp(
          (SKY_TOP.blue + (SKY_BOTTOM.blue - SKY_TOP.blue) * t).to_i,
          0, 255
        )
        @bitmap.fill_rect(0, y, SCREEN_W, 1, Color.new(r, g, b))
        y += 1
      end

      @bitmap.fill_rect(
        0, horizon, SCREEN_W, SCREEN_H - horizon, FLOOR_TOP
      )
    end

    def cast_walls
      half_fov = FOV * Math::PI / 360.0
      projection = (SCREEN_W / 2.0) / Math.tan(half_fov)
      horizon = SCREEN_H / 2

      x = 0
      while x < SCREEN_W
        camera_x = (2.0 * x / SCREEN_W.to_f) - 1.0
        angle = @camera.angle + Math.atan(
          camera_x * Math.tan(half_fov)
        )

        hit = cast_ray(angle)

        if hit == nil
          @zbuffer[x] = MAX_DEPTH
          x += 1
          next
        end

        distance = hit[:distance]
        @zbuffer[x] = distance

        height = (projection / distance).to_i
        top = horizon - height / 2
        bottom = horizon + height / 2

        top = 0 if top < 0
        bottom = SCREEN_H - 1 if bottom >= SCREEN_H

        if bottom >= top
          draw_wall_column(
            x, top, bottom, hit[:tile], hit[:tex_x],
            hit[:side], distance
          )
        end

        x += 1
      end
    end

    def cast_ray(angle)
      dx = Math.cos(angle)
      dy = Math.sin(angle)

      map_x = @camera.x.floor
      map_y = @camera.y.floor

      delta_x = dx.abs < 0.000001 ? 1.0e30 : (1.0 / dx).abs
      delta_y = dy.abs < 0.000001 ? 1.0e30 : (1.0 / dy).abs

      if dx < 0
        step_x = -1
        side_x = (@camera.x - map_x) * delta_x
      else
        step_x = 1
        side_x = (map_x + 1.0 - @camera.x) * delta_x
      end

      if dy < 0
        step_y = -1
        side_y = (@camera.y - map_y) * delta_y
      else
        step_y = 1
        side_y = (map_y + 1.0 - @camera.y) * delta_y
      end

      while true
        if side_x < side_y
          side_x += delta_x
          map_x += step_x
          side = 0
          @world.set_step_x(step_x)
          @world.set_step_y(0)
        else
          side_y += delta_y
          map_y += step_y
          side = 1
          @world.set_step_x(0)
          @world.set_step_y(step_y)
        end

        return nil unless @world.valid?(map_x, map_y)

        wall = @world.edge(map_x, map_y, side)

        if wall != nil
          if side == 0
            distance = (
              map_x - @camera.x + (1 - step_x) / 2.0
            ) / dx
            wall_pos = @camera.y + distance * dy
          else
            distance = (
              map_y - @camera.y + (1 - step_y) / 2.0
            ) / dy
            wall_pos = @camera.x + distance * dx
          end

          wall_pos -= wall_pos.floor

          return {
            :distance => distance.abs,
            :tile => wall[0],
            :tex_x => wall_pos,
            :side => side
          }
        end
      end
    end

    def wall_color(distance, side)
      brightness = 1.0 - distance / MAX_DEPTH
      brightness = 0.25 if brightness < 0.25
      brightness *= 0.78 if side == 1

      fog = (distance - 7.0) / 18.0
      fog = 0.0 if fog < 0.0
      fog = 1.0 if fog > 1.0

      r = (175 * brightness).to_i
      g = (175 * brightness).to_i
      b = (185 * brightness).to_i

      r = (r + (FOG_COLOR.red - r) * fog).to_i
      g = (g + (FOG_COLOR.green - g) * fog).to_i
      b = (b + (FOG_COLOR.blue - b) * fog).to_i

      Color.new(r, g, b)
    end

    def draw_wall_column(x, top, bottom, tile_id, tex_x, side, distance)
      texture = @textures.tile(tile_id)

      if texture == nil
        @bitmap.fill_rect(
          x, top, 1, bottom - top + 1,
          wall_color(distance, side)
        )
        return
      end

      source = texture[0]
      rect = texture[1]

      sx = rect.x + P3D.clamp(
        (tex_x * rect.width).to_i,
        0, rect.width - 1
      )

      @bitmap.stretch_blt(
        Rect.new(x, top, 1, bottom - top + 1),
        source,
        Rect.new(sx, rect.y, 1, rect.height)
      )

      if side == 1
        @bitmap.fill_rect(
          x, top, 1, bottom - top + 1,
          Color.new(0, 0, 0, 45)
        )
      end

      fog = (distance - 7.0) / 18.0
      fog = 0.0 if fog < 0.0
      fog = 1.0 if fog > 1.0

      if fog > 0.0
        @bitmap.fill_rect(
          x, top, 1, bottom - top + 1,
          Color.new(
            FOG_COLOR.red, FOG_COLOR.green, FOG_COLOR.blue,
            (fog * 210).to_i
          )
        )
      end
    end

    def draw_floor
      horizon = SCREEN_H / 2
      half_fov = FOV * Math::PI / 360.0

      y = horizon
      while y < SCREEN_H
        row = y - horizon + 1
        distance = 0.52 * SCREEN_H.to_f / row

        left_angle = @camera.angle - half_fov
        right_angle = @camera.angle + half_fov

        lx = @camera.x + Math.cos(left_angle) * distance
        ly = @camera.y + Math.sin(left_angle) * distance
        rx = @camera.x + Math.cos(right_angle) * distance
        ry = @camera.y + Math.sin(right_angle) * distance

        x = 0
        while x < SCREEN_W
          t = x.to_f / SCREEN_W
          wx = lx + (rx - lx) * t
          wy = ly + (ry - ly) * t
          @bitmap.fill_rect(
            x, y, 1, 1,
            floor_color(wx.floor, wy.floor, distance)
          )
          x += 1
        end

        y += 1
      end
    end

    def floor_color(tx, ty, distance)
      base = FLOOR_BOTTOM

      if @world.valid?(tx, ty)
        ids = @world.layers(tx, ty)
        id = 0

        0.upto(2) do |z|
          if ids[z] != 0
            id = ids[z]
            break
          end
        end

        if id > 0
          v = (id * 17 + tx * 11 + ty * 7) & 31
          base = Color.new(
            P3D.clamp(base.red + v - 12, 0, 255),
            P3D.clamp(base.green + v - 12, 0, 255),
            P3D.clamp(base.blue + v - 12, 0, 255)
          )
        end
      end

      fog = distance / MAX_DEPTH
      fog = 1.0 if fog > 1.0

      Color.new(
        (base.red + (FOG_COLOR.red - base.red) * fog).to_i,
        (base.green + (FOG_COLOR.green - base.green) * fog).to_i,
        (base.blue + (FOG_COLOR.blue - base.blue) * fog).to_i
      )
    end

    def draw_events
      return unless $game_map.events

      objects = []

      $game_map.events.each_value do |event|
        next if event == nil
        next if event.erased if event.respond_to?(:erased)
        next if event.opacity <= 0

        dx = event.x + 0.5 - @camera.x
        dy = event.y + 0.5 - @camera.y
        distance = Math.sqrt(dx * dx + dy * dy)
        next if distance < 0.05
        next if distance > MAX_DEPTH

        relative = normalize(Math.atan2(dy, dx) - @camera.angle)
        objects << [event, distance, relative]
      end

      objects.sort! { |a, b| b[1] <=> a[1] }

      objects.each do |item|
        draw_event(item[0], item[1], item[2])
      end
    end

    def normalize(a)
      while a > Math::PI
        a -= Math::PI * 2.0
      end
      while a < -Math::PI
        a += Math::PI * 2.0
      end
      a
    end

    def draw_event(event, distance, relative)
      half_fov = FOV * Math::PI / 360.0
      return if relative.abs > half_fov + 0.20

      corrected = distance * Math.cos(relative)
      return if corrected <= 0.05

      projection = (SCREEN_W / 2.0) / Math.tan(half_fov)

      if event.tile_id != nil && event.tile_id > 0
        texture = @textures.tile(event.tile_id)
        return if texture == nil
        source = texture[0]
        rect = texture[1]
        source_width = rect.width
        source_height = rect.height
      else
        name = event.character_name
        return if name == nil || name == ''
        source = @textures.character(name, event.character_hue)
        return if source == nil

        cell_w = source.width / 4
        cell_h = source.height / 4
        index = event.character_index
        index = 0 if index == nil

        base_x = (index % 4) * cell_w
        base_y = (index / 4) * (cell_h * 4)

        dir_row =
          case event.direction
          when 2 then 0
          when 4 then 1
          when 6 then 2
          when 8 then 3
          else 0
          end

        pattern = event.pattern
        pattern = 1 if pattern == nil
        pattern = 0 if pattern < 0
        pattern = 3 if pattern > 3

        rect = Rect.new(
          base_x + pattern * cell_w,
          base_y + dir_row * cell_h,
          cell_w,
          cell_h
        )

        source_width = cell_w
        source_height = cell_h
      end

      sprite_h = (projection / corrected).to_i
      return if sprite_h < 2

      sprite_w = (
        sprite_h * source_width.to_f / source_height
      ).to_i

      sprite_w = 2 if sprite_w < 2
      sprite_w = 128 if sprite_w > 128

      center =
        SCREEN_W / 2.0 +
        (
          Math.tan(relative) /
          Math.tan(half_fov)
        ) * (SCREEN_W / 2.0)

      left = center.to_i - sprite_w / 2
      top = SCREEN_H / 2 - sprite_h

      sx = 0
      while sx < sprite_w
        screen_x = left + sx

        if screen_x >= 0 && screen_x < SCREEN_W
          if corrected < @zbuffer[screen_x]
            source_x = rect.x + (
              sx.to_f / sprite_w * rect.width
            ).to_i

            source_x = P3D.clamp(
              source_x,
              rect.x,
              rect.x + rect.width - 1
            )

            @bitmap.stretch_blt(
              Rect.new(screen_x, top, 1, sprite_h),
              source,
              Rect.new(source_x, rect.y, 1, rect.height)
            )
          end
        end

        sx += 1
      end
    end
  end

  class Controller

    def initialize(camera, world)
      @camera = camera
      @world = world
    end

    def update
      if Input.press?(Input::LEFT)
        @camera.angle -= TURN_SPEED
      end

      if Input.press?(Input::RIGHT)
        @camera.angle += TURN_SPEED
      end

      forward = 0.0
      forward += MOVE_SPEED if Input.press?(Input::UP)
      forward -= MOVE_SPEED if Input.press?(Input::DOWN)

      dx = Math.cos(@camera.angle) * forward
      dy = Math.sin(@camera.angle) * forward

      try_move(dx, dy)
    end

    def try_move(dx, dy)
      try_x = @camera.x + dx
      try_y = @camera.y + dy

      if free?(try_x, @camera.y)
        @camera.x = try_x
      end

      if free?(@camera.x, try_y)
        @camera.y = try_y
      end
    end

    def free?(x, y)
      tx = x.floor
      ty = y.floor
      return false unless @world.valid?(tx, ty)

      r = COLLISION

      points = [
        [x - r, y - r],
        [x + r, y - r],
        [x - r, y + r],
        [x + r, y + r]
      ]

      points.each do |px, py|
        cx = px.floor
        cy = py.floor
        return false unless @world.valid?(cx, cy)

        if cx > tx
          return false unless $game_map.passable?(tx, ty, 6)
          return false unless $game_map.passable?(cx, cy, 4)
        elsif cx < tx
          return false unless $game_map.passable?(tx, ty, 4)
          return false unless $game_map.passable?(cx, cy, 6)
        end

        if cy > ty
          return false unless $game_map.passable?(tx, ty, 2)
          return false unless $game_map.passable?(cx, cy, 8)
        elsif cy < ty
          return false unless $game_map.passable?(tx, ty, 8)
          return false unless $game_map.passable?(cx, cy, 2)
        end
      end

      true
    end
  end

  class Scene

    def initialize
      @camera = Camera.new
      @world = World.new
      @controller = Controller.new(@camera, @world)
      @renderer = Renderer.new(@camera, @world)

      @sprite = Sprite.new
      @sprite.bitmap = @renderer.bitmap
      @sprite.x = 0
      @sprite.y = 0
      @sprite.zoom_x = 4.0
      @sprite.zoom_y = 4.0
      @sprite.z = 9999

      @stop = false

      $game_player.transparent = true if $game_player
    end

    def request_stop
      @stop = true
    end

    def main
      Graphics.transition

      loop do
        Graphics.update
        Input.update

        break if @stop
        break if Input.trigger?(Input::F6)

        @controller.update
        @renderer.render
      end

      Graphics.freeze
    end

    def dispose
      $game_player.transparent = false if $game_player
      @renderer.dispose
      @sprite.dispose unless @sprite.disposed?
    end
  end
end

# Compatibility for older P3D script entries that referenced P3D::P3D::Scene.
# This lets an older P3D_Main coexist while Scripts.rxdata is being replaced.
module P3D
  P3D::P3D = ::P3D unless defined?(P3D::P3D)
end

class Scene_Map
  alias p3d_update update unless method_defined?(:p3d_update)

  def update
    p3d_update
    if Input.trigger?(Input::F6) && !P3D.running?
      P3D.start
    end
  end
end
